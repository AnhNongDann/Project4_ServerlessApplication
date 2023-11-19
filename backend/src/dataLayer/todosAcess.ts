import * as AWS from 'aws-sdk'
const AWSXRay = require('aws-xray-sdk');
import { createLogger } from '../utils/logger'
import { TodoItem } from '../models/TodoItem'
import { TodoUpdate } from '../models/TodoUpdate';

const XAWS = AWSXRay.captureAWS(AWS)

const logger = createLogger('TodosAccess')

// TODO: Implement the dataLayer logic


export class TodosAccess {
    constructor(
        private readonly todosTable = process.env.TODOS_TABLE,
        private readonly docClient = new XAWS.DynamoDB.DocumentClient(),
    ) { }

    async getAllTodos(userId: string): Promise<TodoItem[]> {
        logger.info('start get all todos function', userId)

        const result = await this.docClient.query({
            TableName: this.todosTable,
            IndexName: process.env.TODOS_CREATED_AT_INDEX,
            KeyConditionExpression: 'userId= :userId',
            ExpressionAttributeValues: {
                ':userId': userId
            }
        }).promise()
        
        const value = JSON.stringify(result)
        logger.info('end call get all todo with result: '+value)
        const items = result.Items
        return items as TodoItem[]
    }
    

    async createTodoItem(todoItem: TodoItem): Promise<TodoItem> {
        logger.info('start Create todo item function called', todoItem)

        const result = await this.docClient
            .put({
                TableName: this.todosTable,
                Item: todoItem
            })
            .promise()

        logger.info('todo item create result ', result)
        return todoItem as TodoItem
    }

    async updateTodo(
        todoUpdate: TodoUpdate,
        todoId: string,
        userId: string
    ): Promise<TodoUpdate> {
        logger.info('Update todo')
        const params = {
            TableName: this.todosTable,
            Key: {
                todoId: todoId,
                userId: userId
            },
            UpdateExpression: 'set #name=:name, dueDate = :dueDate, done = :done',
            ExpressionAttributeNames: {
                "#name": "name"
            },
            ExpressionAttributeValues: {
                ':name': todoUpdate.name,
                ':dueDate': todoUpdate.dueDate,
                ':done': todoUpdate.done
            }, 
            ReturnValues: "ALL_NEW"
        }
        const result = await this.docClient.update(params).promise()
        const todoItemUpdate = result.Attributes as TodoUpdate
        logger.info('todo item uploaded', todoItemUpdate)
        return todoItemUpdate as TodoUpdate
    }
    async deleteTodoBy(todoId: string, userId: string): Promise<string> {
        logger.info('start Delete todo with', todoId, userId)

        const params = {
            TableName: this.todosTable,
            Key: {
                todoId: todoId,
                userId: userId
            }
        }

        const result = await this.docClient.delete(params).promise()
        logger.info('end delte todo',result)
        return 'completed delete '+todoId
    }
    async updateAttachmentUrl(todoId: string, userId: string, attachmentUrl: string): Promise<string> {
        logger.info('Update attachmentUrl'+attachmentUrl)

        const params = {
            TableName: this.todosTable,
            Key: {
                todoId: todoId,
                userId: userId
            },
            UpdateExpression: 'set attachmentUrl = :attachmentUrl',
            ExpressionAttributeValues: {
                ':attachmentUrl': attachmentUrl
            }
        }

        const result = await this.docClient.update(params).promise()
        logger.info(result)
        return 'Update attachmentUrl successfully'
    }

    async searchTodos(userId: string, keyword: string): Promise<TodoItem[]> {
        let items = await this.getAllTodos(userId)

        items = items.filter((item) => item.name.includes(keyword));
        return items as TodoItem[];
      }
}