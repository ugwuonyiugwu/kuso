import { db } from '@/db';
import { initTRPC } from '@trpc/server';
import { cache } from 'react';
import superjson from 'superjson';

export const createTRPCContext = cache(async () => {
    return { 
        db, 
    };
});

export type Context = Awaited<ReturnType<typeof createTRPCContext>>  

const t = initTRPC.context<Context>().create({ 
    transformer: superjson,
});

export const createTRPCRouter = t.router;
export const createCallerFactory = t.createCallerFactory;
export const baseProcedure = t.procedure;