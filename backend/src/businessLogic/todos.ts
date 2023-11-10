import { TodosAccess } from './todosAcess'
import { AttachmentUtils } from '../helpers/attachmentUtils';
import { TodoItem } from '../models/TodoItem'
import { CreateTodoRequest } from '../requests/CreateTodoRequest'
import { UpdateTodoRequest } from '../requests/UpdateTodoRequest'
import { createLogger } from '../utils/logger'
import * as uuid from 'uuid'
import * as createError from 'http-errors'

// TODO: Implement businessLogic


const logger = createLogger('todosAcess');
const todosAcess = new TodosAccess()
const attachmentUtils = new AttachmentUtils();

export async function createTodo(newTodo: CreateTodoRequest, userId: string): Promise<TodoItem> {

    const todoId = uuid.v4();
    const createAt = new Date().toISOString();
    const s3AttachId = attachmentUtils.getAttachmentUrl(todoId)
    const newItem = {
        userId, 
        todoId, 
        createAt, 
        done: false,
        attachmentUrl: s3AttachId,
        ...newTodo
    }

    return await todosAcess.createTodoItem(newItem)
}