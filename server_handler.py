global x
from checkboard import Checkboard
#a function that pritnt the board matrix
def printcheckboard(x):
    print('\n'.join([''.join(['{:4}'.format(item) for item in row])
                     for row in x]))

#a function that make a start board matrix
def makecheckboard():
    return Checkboard()


def Main():
    x = Checkboard()
    x.print_board()
    x.move([2,2],[3,3])
    x.print_board()


if __name__ == '__main__':
    Main()