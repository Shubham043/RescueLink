import {openDB} from 'idb';
const DB_NAME = 'rescueDB';
const STORE_NAME = 'sosQueue';

export const initDB = async ()=>{
    return openDB(DB_NAME,1,{
        upgrade(db){
            if(!db.objectStoreNames.contains(STORE_NAME)){
                db.createObjectStore(STORE_NAME,{
                    keyPath:'id',
                    autoIncrement:true,
                })
            }
        }
    })
}

export const addSOS = async(data)=>{
    const db = await initDB();
    await db.add(STORE_NAME,data)
}

export const getSOS = async()=>{
    const db = await initDB();
    return await db.getAll(STORE_NAME);
}
export const deleteSOS = async(id)=>{
    const db = await initDB();
    await db.delete(STORE_NAME,id);
}