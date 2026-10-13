import "server-only";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { Redis } from "@upstash/redis";
import type { Library } from "../types";
import { seedLibrary } from "./seed";

/* 本機開發：資料存在專案根目錄的 data/db.json；刪掉這個檔案就會回到示範資料 */
const FILE = path.join(process.cwd(), "data", "db.json");

export class UserError extends Error {
  status: number;
  constructor(msg: string, status = 400) {
    super(msg);
    this.status = status;
  }
}

/* ---------- 存放位置 ----------
   有設定 Upstash Redis 的環境變數（部署到 Vercel 時）→ 存在雲端 Redis；
   沒有（在自己電腦開發時）→ 存在 data/db.json。 */
type Backend = {
  read(): Promise<Library | null>;
  write(s: Library): Promise<void>;
  /* 同一時間只讓一個修改執行，避免互相覆蓋 */
  withLock<T>(fn: () => Promise<T>): Promise<T>;
};

const g = globalThis as unknown as { __lib?: Library; __libLock?: Promise<unknown>; __redis?: Redis };

const fileBackend: Backend = {
  async read() {
    if (g.__lib) return g.__lib;
    try {
      g.__lib = JSON.parse(await readFile(FILE, "utf8")) as Library;
      return g.__lib;
    } catch {
      return null;
    }
  },
  async write(s) {
    g.__lib = s;
    await mkdir(path.dirname(FILE), { recursive: true });
    await writeFile(FILE, JSON.stringify(s, null, 2), "utf8");
  },
  withLock(fn) {
    const p = (g.__libLock ?? Promise.resolve()).then(fn, fn);
    g.__libLock = p.catch(() => {});
    return p;
  },
};

const REDIS_URL = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL;
const REDIS_TOKEN = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN;
const KEY = "library:state";
const LOCK = "library:lock";
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

function redisBackend(): Backend {
  const redis = (g.__redis ??= new Redis({ url: REDIS_URL!, token: REDIS_TOKEN! }));
  return {
    read: () => redis.get<Library>(KEY),
    write: async (s) => {
      await redis.set(KEY, s);
    },
    /* 雲端上可能同時有好幾台伺服器在跑，所以鎖要放在 Redis 裡 */
    async withLock(fn) {
      const token = crypto.randomUUID();
      const deadline = Date.now() + 8000;
      while (!(await redis.set(LOCK, token, { nx: true, px: 10000 }))) {
        if (Date.now() > deadline) throw new UserError("系統忙碌中，請再試一次", 503);
        await sleep(80);
      }
      try {
        return await fn();
      } finally {
        await redis.eval('if redis.call("get", KEYS[1]) == ARGV[1] then return redis.call("del", KEYS[1]) else return 0 end', [LOCK], [token]);
      }
    },
  };
}

/* 舊資料沒有 places 欄位；書上用到、但清單裡沒有的位置也補進清單 */
function normalize(L: Library): Library {
  const places = [...(L.places ?? [])];
  for (const b of L.books) if (b.location && !places.includes(b.location)) places.push(b.location);
  L.places = places;
  return L;
}

const backend = (): Backend => (REDIS_URL && REDIS_TOKEN ? redisBackend() : fileBackend);

export async function getLibrary(): Promise<Library> {
  const b = backend();
  const s = await b.read();
  if (s) return normalize(s);
  return b.withLock(async () => {
    const again = await b.read();
    if (again) return normalize(again);
    const fresh = seedLibrary();
    await b.write(fresh);
    return fresh;
  });
}

/* 一次只處理一個修改，避免同時寫入互相覆蓋 */
export function mutate<T>(fn: (L: Library) => T): Promise<{ library: Library; result: T }> {
  const b = backend();
  return b.withLock(async () => {
    const work = normalize(structuredClone((await b.read()) ?? seedLibrary()));
    const result = fn(work);
    normalize(work);
    await b.write(work);
    return { library: work, result };
  });
}
