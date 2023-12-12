import { Response } from "express";
import {MONGODB_ATLAS_VECTOR_URI} from "../config/config";
import { MongoClient } from "mongodb";
export default (async () => {
    const { OpenAI } = await import ("langchain/llms/openai");
    const { AIMessage } = await import ("langchain/schema");
    const { BufferMemory, ChatMessageHistory } = await import ("langchain/memory");
    const { PDFLoader } = await import ("langchain/document_loaders/fs/pdf");
    const { RecursiveCharacterTextSplitter } = await import ("langchain/text_splitter");
    const { OpenAIEmbeddings } = await import ("langchain/embeddings/openai");
    const { MongoDBAtlasVectorSearch } = await import ("langchain/vectorstores/mongodb_atlas");
    const { ConversationalRetrievalQAChain, LLMChain} = await import ("langchain/chains");
    const { PromptTemplate } = await import ("langchain/prompts");
    const { ChatOpenAI } = await import ("langchain/chat_models/openai");
    const chat = new ChatOpenAI({
        temperature: 0,
        modelName: 'gpt-3.5-turbo',
        streaming: true,
    });
    const client = new MongoClient(MONGODB_ATLAS_VECTOR_URI || "");
    const namespace = "vectoreStore.new";
    const [dbName, collectionName] = namespace.split(".");
    const collection = client.db(dbName).collection(collectionName);
    const vectorstore = await connectVectoreStore()
    interface MemoryStorage {
        // Define the structure of MemoryStorage
        [id: string]:  typeof BufferMemory | ((id:string)=>void)|any;
      
        pushMemory: (id:string)=>void;
      }
    const memoryStorage : MemoryStorage = {
        pushMemory: function(id: string){
           this[id] = new BufferMemory({
               chatHistory: new ChatMessageHistory([new AIMessage('Ask me a question')])
           });
           setTimeout(
               ()=>{
               delete this[id]
           },600000)
       }
   }
    async function connectVectoreStore(){
        const vectorstore = new MongoDBAtlasVectorSearch(new OpenAIEmbeddings,{
            collection
        })
        return vectorstore
    }
    const reply = async (message:string|undefined|any,id:string,res:Response) => {
        try{
            if(memoryStorage[id]===undefined){
                memoryStorage.pushMemory(id)
            }
            console.log("reply function")
            const qa =  ConversationalRetrievalQAChain.fromLLM(chat,vectorstore.asRetriever({
                searchType: "mmr",
                searchKwargs: {
                  fetchK: 2,
                  lambda: 0.1,
                },
              }))
            const reply = await qa.call({
                'question': message,
                'chat_history': memoryStorage[id]
            },[
                {
                    handleLLMNewToken(token) {
                        res.write('event: message\n');
                        res.write(`data: ${token} `);
                        res.write('\n\n');
                        res.flush();
                    },
                }
            ]); 
            res.write('event: close\n');
            res.write(`data: { "time": ${Date.now()} }`);
            res.write('\n\n');    
            res.flush()
            return reply;
        }
        catch(e){
            // console.log(e);return null;
        }
    }
    return {
        reply
    }
})()






