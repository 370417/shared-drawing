from sqlalchemy import Column, Integer, String
from sqlalchemy.exc import IntegrityError
from db import Base, db_session

class User(Base):
    __tablename__ = 'users'
    id = Column(Integer, primary_key=True)
    public_id = Column(String(120), unique=True)

    def __repr__(self):
        return '<User %r>' % (self.name)

    def register():
        success = False
        while not succes:
            try:
                attempt_register()
            except IntegrityError as e:
                pass
        db_session.add(self)
        db_session.commit()
    
    def attempt_register():


def generate_unique_id():

