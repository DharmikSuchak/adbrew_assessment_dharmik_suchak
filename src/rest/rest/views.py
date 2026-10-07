from django.shortcuts import render
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
import json, logging, os
from pymongo import MongoClient
from bson import ObjectId

mongo_uri = 'mongodb://' + os.environ["MONGO_HOST"] + ':' + os.environ["MONGO_PORT"]
db = MongoClient(mongo_uri)['test_db']

class TodoListView(APIView):

    def get(self, request):
        try:
            todos_cursor = db.todos.find()
            todos = []
            for todo in todos_cursor:
                todos.append({
                    'id': str(todo['_id']),
                    'description': todo.get('description', '')
                })
            return Response(todos, status=status.HTTP_200_OK)
        except Exception as e:
            logging.error(f"Error fetching todos: {e}")
            return Response({'error': 'Failed to fetch todos'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
        
    def post(self, request):
        description = request.data.get('description', '').strip()
        if not description:
            return Response({'error': 'Description is required'}, status=status.HTTP_400_BAD_REQUEST)
        
        try:
            result = db.todos.insert_one({'description': description})
            return Response({
                'id': str(result.inserted_id),
                'description': description
            }, status=status.HTTP_201_CREATED)
        except Exception as e:
            logging.error(f"Error creating todo: {e}")
            return Response({'error': 'Failed to create todo'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

class TodoDetailView(APIView):
    def delete(self, request, todo_id):
        try:
            result = db.todos.delete_one({'_id': ObjectId(todo_id)})
            if result.deleted_count == 1:
                return Response({'status': 'deleted'}, status=status.HTTP_200_OK)
            return Response({'error': 'Todo not found'}, status=status.HTTP_404_NOT_FOUND)
        except Exception as e:
            logging.error(f"Error deleting todo: {e}")
            return Response({'error': 'Failed to delete todo'}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
