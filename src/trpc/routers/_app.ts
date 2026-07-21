import { userRouter } from "@/modules/Landing/procedure";
import { createTRPCRouter } from '../init';

export const appRouter = createTRPCRouter({
 
 user: userRouter,
});

export type AppRouter = typeof appRouter; 