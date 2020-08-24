class Checkboard:
    #create a checkers board

    def __init__(self):
        self.board = [[1,0,1,0,1,0,1,0],
                      [0,1,0,1,0,1,0,1],
                      [1,0,1,0,1,0,1,0],
                      [0,0,0,0,0,0,0,0],
                      [0,0,0,0,0,0,0,0],
                      [2,0,2,0,2,0,2,0],
                      [0,2,0,2,0,2,0,2],
                      [2,0,2,0,2,0,2,0]]
    #printing the board matrix

    def print_board(self):
        print('\n'.join([''.join(['{:4}'.format(item) for item in row])
                         for row in self.board] )+'\n')

    #moving a solider - gets 2 tupples one for the current location index and one for the futre location
    #0-empty 1-black 2-white 3-black king 4-white king
    def move(self,prev,next):
        self.board[prev[0]][prev[1]] = 0
        if self.is_premotion(next):
            self.board[next[0]][next[1]] = self.board[next[0]][next[1]] + 2


    def is_premotion(next):
        if next[1] == 0 or next[1] == 7:
            return 1
        return 0