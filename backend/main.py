from fastapi import FastAPI, HTTPException, UploadFile, File, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from langchain_deepseek import ChatDeepSeek
from langchain_core.messages import HumanMessage, AIMessage
import os
from dotenv import load_dotenv

# 加载环境变量
load_dotenv(override = True)

# 初始化FastAPI应用
app = FastAPI()

# 配置CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 在生产环境中应该设置具体的前端地址
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 消息请求模型
class ModelSettings(BaseModel):
    temperature: float
    topP: float
    maxTokens: int

class MessageRequest(BaseModel):
    message: str
    session_id: str
    model_settings: ModelSettings = None

# 会话管理字典，存储对话历史和上传的文件
sessions = {}

# 文件存储字典，存储上传的文件内容
file_storage = {}

# 根路径
@app.get("/")
async def root():
    return {"message": "DeepChat API is running"}

# 对话端点
@app.post("/chat")
async def chat(request: MessageRequest):
    session_id = request.session_id
    message = request.message
    model_settings = request.model_settings
    
    # 检查会话是否存在，不存在则创建
    if session_id not in sessions:
        sessions[session_id] = []
    
    try:
        # 获取会话历史
        chat_history = sessions[session_id]
        
        # 构建消息列表
        messages = []
        for msg in chat_history:
            if msg["role"] == "user":
                messages.append(HumanMessage(content=msg["content"]))
            elif msg["role"] == "assistant":
                messages.append(AIMessage(content=msg["content"]))
        
        # 检查是否有上传的文件
        uploaded_files = file_storage.get(session_id, [])
        
        # 构建完整的消息内容，包括文件内容
        full_message = message
        if uploaded_files:
            file_info = "\n\n上传的文件内容：\n"
            for file in uploaded_files:
                file_info += f"文件名: {file['filename']}\n"
                file_info += f"内容: {file['file_content']}\n\n"
            full_message += file_info
        
        # 添加当前用户消息（包含文件内容）
        messages.append(HumanMessage(content=full_message))
        
        # 初始化DeepSeek模型，使用模型设置参数
        temperature = model_settings.temperature if model_settings else 0.0
        top_p = model_settings.topP if model_settings else 0.9
        max_tokens = model_settings.maxTokens if model_settings else 1000
        
        llm = ChatDeepSeek(
            model="deepseek-chat",
            temperature=temperature,
            top_p=top_p,
            max_tokens=max_tokens,
            timeout=None,
            max_retries=2,
        )
        
        # 生成响应
        print(f"Sending message to DeepSeek: {full_message[:100]}...")  # 只打印前100个字符
        print(f"Using model settings: temperature={temperature}, top_p={top_p}, max_tokens={max_tokens}")
        response = llm.invoke(messages)
        print(f"Received response from DeepSeek: {response.content}")
        
        # 更新会话历史
        chat_history.append({"role": "user", "content": message})
        chat_history.append({"role": "assistant", "content": response.content})
        
        return {"response": response.content}
    except Exception as e:
        print(f"Error processing message: {str(e)}")
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

# 清除会话端点
@app.post("/clear-session/{session_id}")
async def clear_session(session_id: str):
    if session_id in sessions:
        del sessions[session_id]
    return {"message": "Session cleared"}

# 文件上传端点
@app.post("/upload")
async def upload_files(request: Request):
    try:
        form = await request.form()
        session_id = form.get("session_id", "")
        files = form.getlist("files")
        
        uploaded_files = []
        
        # 确保会话的文件存储存在
        if session_id not in file_storage:
            file_storage[session_id] = []
        
        for file in files:
            # Check file type
            if not (file.filename.endswith('.pdf') or file.filename.endswith('.doc') or file.filename.endswith('.docx')):
                raise HTTPException(status_code=400, detail=f"不支持的文件类型: {file.filename}")
            
            # Read file content
            file_content = await file.read()
            
            # Process file based on type
            content = ""
            if file.filename.endswith('.pdf'):
                # Read PDF content (placeholder)
                content = f"PDF文件内容: {file.filename}"
            elif file.filename.endswith('.doc') or file.filename.endswith('.docx'):
                # Read DOC/DOCX content (placeholder)
                content = f"Word文件内容: {file.filename}"
            
            # Store file content in file_storage
            file_storage[session_id].append({
                "filename": file.filename,
                "content": content,
                "file_content": file_content.decode('utf-8', errors='replace')[:10000]  # 限制文件内容大小，避免超出模型上下文限制
            })
            
            uploaded_files.append({
                "filename": file.filename,
                "content": content
            })
        
        return {"message": "文件上传成功", "files": uploaded_files}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# 健康检查端点
@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
