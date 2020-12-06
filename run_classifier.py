import sys
import json

def main():
    x = json.loads(sys.argv[1])
    print(x)
    sys.stdout.flush()

if __name__ == '__main__':
    main()