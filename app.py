import os
import logging
import eventlet
from flask import Flask, render_template

from db import init_db

# app = Flask(__name__)
# app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///' + \
#     os.path.join(app.instance_path, 'app.db')
# app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
# init_db(app)

def create_app(config_filename=None):
    app = Flask(__name__)
    app.config.from_pyfile(config_filename)
    init_db(app)
    return app
