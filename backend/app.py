from flask import Flask, request, jsonify
from flask_cors import CORS
import psycopg2
import os
from dotenv import load_dotenv

load_dotenv()

app = Flask(__name__)
CORS(app)

# Configuração do banco de dados
DATABASE_URL = os.getenv('DATABASE_URL', 'postgresql://postgres:postgres@localhost:5432/nossa_historia')

def get_db():
    conn = psycopg2.connect(DATABASE_URL)
    return conn

def init_db():
    conn = get_db()
    cur = conn.cursor()
    
    # Criar tabelas
    cur.execute('''
        CREATE TABLE IF NOT EXISTS love_letters (
            id SERIAL PRIMARY KEY,
            title TEXT NOT NULL,
            content TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    ''')
    
    cur.execute('''
        CREATE TABLE IF NOT EXISTS date_ideas (
            id SERIAL PRIMARY KEY,
            idea TEXT NOT NULL,
            completed BOOLEAN NOT NULL DEFAULT FALSE,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    ''')
    
    cur.execute('''
        CREATE TABLE IF NOT EXISTS videos (
            id SERIAL PRIMARY KEY,
            title TEXT NOT NULL,
            type TEXT NOT NULL,
            src TEXT NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    ''')
    
    conn.commit()
    cur.close()
    conn.close()

# Inicializar o banco de dados
init_db()

# API Endpoints para Love Letters
@app.route('/api/love-letters', methods=['GET', 'POST'])
def love_letters():
    conn = get_db()
    cur = conn.cursor()
    
    if request.method == 'GET':
        cur.execute('SELECT * FROM love_letters ORDER BY created_at DESC')
        letters = cur.fetchall()
        return jsonify([{
            'id': l[0],
            'title': l[1],
            'content': l[2],
            'created_at': l[3].isoformat()
        } for l in letters])
    
    elif request.method == 'POST':
        data = request.json
        cur.execute(
            'INSERT INTO love_letters (title, content) VALUES (%s, %s) RETURNING id',
            (data['title'], data['content'])
        )
        new_id = cur.fetchone()[0]
        conn.commit()
        return jsonify({'id': new_id, 'message': 'Letter added'}), 201

@app.route('/api/love-letters/<int:letter_id>', methods=['DELETE'])
def delete_love_letter(letter_id):
    conn = get_db()
    cur = conn.cursor()
    cur.execute('DELETE FROM love_letters WHERE id = %s', (letter_id,))
    conn.commit()
    return jsonify({'message': 'Letter deleted'})

# API Endpoints para Date Ideas
@app.route('/api/date-ideas', methods=['GET', 'POST'])
def date_ideas():
    conn = get_db()
    cur = conn.cursor()
    
    if request.method == 'GET':
        cur.execute('SELECT * FROM date_ideas ORDER BY created_at DESC')
        ideas = cur.fetchall()
        return jsonify([{
            'id': i[0],
            'idea': i[1],
            'completed': i[2],
            'created_at': i[3].isoformat()
        } for i in ideas])
    
    elif request.method == 'POST':
        data = request.json
        cur.execute(
            'INSERT INTO date_ideas (idea) VALUES (%s) RETURNING id',
            (data['idea'],)
        )
        new_id = cur.fetchone()[0]
        conn.commit()
        return jsonify({'id': new_id, 'message': 'Date idea added'}), 201

@app.route('/api/date-ideas/<int:idea_id>', methods=['PUT', 'DELETE'])
def manage_date_idea(idea_id):
    conn = get_db()
    cur = conn.cursor()
    
    if request.method == 'PUT':
        data = request.json
        cur.execute(
            'UPDATE date_ideas SET completed = %s WHERE id = %s',
            (data['completed'], idea_id)
        )
        conn.commit()
        return jsonify({'message': 'Date idea updated'})
    
    elif request.method == 'DELETE':
        cur.execute('DELETE FROM date_ideas WHERE id = %s', (idea_id,))
        conn.commit()
        return jsonify({'message': 'Date idea deleted'})

# API Endpoints para Videos
@app.route('/api/videos', methods=['GET', 'POST'])
def videos():
    conn = get_db()
    cur = conn.cursor()
    
    if request.method == 'GET':
        cur.execute('SELECT * FROM videos ORDER BY created_at DESC')
        videos = cur.fetchall()
        return jsonify([{
            'id': v[0],
            'title': v[1],
            'type': v[2],
            'src': v[3],
            'created_at': v[4].isoformat()
        } for v in videos])
    
    elif request.method == 'POST':
        data = request.json
        cur.execute(
            'INSERT INTO videos (title, type, src) VALUES (%s, %s, %s) RETURNING id',
            (data['title'], data['type'], data['src'])
        )
        new_id = cur.fetchone()[0]
        conn.commit()
        return jsonify({'id': new_id, 'message': 'Video added'}), 201

@app.route('/api/videos/<int:video_id>', methods=['DELETE'])
def delete_video(video_id):
    conn = get_db()
    cur = conn.cursor()
    cur.execute('DELETE FROM videos WHERE id = %s', (video_id,))
    conn.commit()
    return jsonify({'message': 'Video deleted'})

if __name__ == '__main__':
    app.run(debug=True) 