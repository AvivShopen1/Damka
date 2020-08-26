import numpy as np
global x


def printcheckboard(x):
    print('\n'.join([''.join(['{:4}'.format(item) for item in row])
                     for row in x]))


def makecheckboard():
    return [[1,0,1,0,1,0,1,0],[0,1,0,1,0,1,0,1],[1,0,1,0,1,0,1,0],[0,0,0,0,0,0,0,0],[0,0,0,0,0,0,0,0],
            [2,0,2,0,2,0,2,0],[0,2,0,2,0,2,0,2],[2,0,2,0,2,0,2,0]]


def move(x,move):
    pass


def Main():
    x = makecheckboard()
    printcheckboard(x)

if __name__ == '__main__':
    Main()