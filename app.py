import os
import logging
import gevent
from flask import Flask, render_template
from flask_sockets import Sockets

from db import db_session, init_db

app = Flask(__name__)
init_db()

sockets = Sockets(app)

@app.teardown_appcontext
def shutdown_session(exception=None):
    db_session.remove()
