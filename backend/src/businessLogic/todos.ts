import { TodosAccess } from '../dataLayer/todosAcess'
import { AttachmentUtils } from '../helpers/attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import * as createError from 'http-errors'
import { TodoUpdate } from '../models/TodoUpdate';
import { promises } from 'dns';

// TODO: Implement businessLogic

// get todo 
export async function getTodosForUser(userId: string): Promise<TodoItem[]> {
    logger.info("get todo for user function called ")

    return todosAcess.getAllTodos(userId);
}


//create todo 

const logger = createLogger('todosAcess');
const todosAcess = new TodosAccess()
const attachmentUtils = new AttachmentUtils();

export async function createTodo(newTodo: CreateTodoRequest, userId: string): Promise<TodoItem> {

    const todoId = uuid.v4();
    const createAt = new Date().toISOString();
    const s3AttachId = attachmentUtils.getAttachmentUrl(todoId)

    return await todosAcess.createTodoItem({
        todoId: todoId,
        userId: userId,
        done: true,
        name: newTodo.name,
        dueDate: newTodo.dueDate,
        createdAt: new Date().toISOString()
      })
}

// write update todo function 
export async function updateTodo(todoId:string, userId:string, todoUpdate: UpdateTodoRequest): Promise<string>{
    logger.info('update todo function called')

    return await todosAcess.updateTodo(todoUpdate, todoId, userId);
}

// write delete todo function

export async function deleteTodo(userId: string, todoId: string):Promise<string> {

    logger.info('delete todo function called')

    return todosAcess.deleteTodoBy(todoId, userId)
}

//write create attachment function

export async function createAttachmentPresignedUrl(userId:string, todoId: string):Promise<string> {

    logger.info('create attachment function called')

    return attachmentUtils.getUploadUrl(todoId)
    
}