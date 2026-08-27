import {Pool} from 'pg';
import { env } from '../config/env';


export const pool = new Pool({
    connectionString: env.databaseUrl,
});


export async function checkDBConnection():Promise<void>{
    const client = await pool.connect();

    try{
        await client.query(`SELECT 1`);
        console.log("Database Connected");
    }finally{
        client.release();
    }
}