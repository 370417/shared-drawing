from flask import Flask
from flask_sqlalchemy import SQLAlchemy
from uuid import uuid4

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    public_id = db.Column(db.LargeBinary(16), unique=True)

    def __init__(**kwargs):
        super(Foo, self).__init__(**kwargs)
        self.public_id = uuid4().bytes


def init_db(app):
    db.init_app(app)
    db.create_all(app=app)
