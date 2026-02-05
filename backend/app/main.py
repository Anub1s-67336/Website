from fastapi import FastAPI, HTTPException
from typing import Optional, List, Dict
from pydantic import BaseModel

app = FastAPI()


class User(BaseModel):
    id: int
    name: str
    age: int


class Post(BaseModel):
    id: int
    title: str
    body: str
    avtor: User


users = [
    {'id': 1, 'name': "Valerik", 'age': 15},
    {'id': 2, 'name': "Jonsh", 'age': 17},
    {'id': 3, 'name': "Mark", 'age': 45}

]


posts = [
    {'id': 1, 'title': 'News 1', 'body': 'Text 1', 'avtor': users[1]},
    {'id': 2, 'title': 'News 2', 'body': 'Text 2', 'avtor': users[2]},
    {'id': 3, 'title': 'News 3', 'body': 'Text 3', 'avtor': users[0]}
]

@app.get("/")
def root():
    return {"message": "Привет мир"}

@app.get("/items")
def items() -> List[Post]:
    return   [Post(**post) for post in posts]

@app.get("/items/{id}")
def get_items(id: int) -> Post:
    for post in posts:
        if post['id'] == id:
            return Post(**post)
    raise HTTPException(status_code=404, detail='post dont found')

@app.get("/search")
def search(post_id: Optional[int] = None) -> Dict[str, Optional[Post]]:
    if post_id:
         for post in posts:
            if post['id'] == post_id:
                return {"dats": Post(**post)}
         raise HTTPException(status_code=404, detail='post dont found')
    else:
        return{"data": None}    

@app.get("/Users")    
def get_all_users() -> List[User]:
    return [User(**user)for user in users]

@app.get("/Users/{id}")
def get_user(id: int) -> User:
     for user in users:
        if user['id'] == id:
            return User(**user)
     raise HTTPException(status_code=404, detail='post dont found')
