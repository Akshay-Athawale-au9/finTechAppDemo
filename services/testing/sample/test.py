from re import sub
import pytest

def add5(a):
    return a+5

def sub5(a):
    return a-5


def test_te1():    
    assert add5(3)==8

def test_te2():
    assert sub5(3)==-2

def test_answer1():
  a = 5
  b = 10
  assert a==b
  
def test_answer2():
  c = 15
  d = 3*5
  assert c==d
