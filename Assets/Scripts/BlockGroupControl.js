#pragma strict

var RotateGroupAudio : AudioClip;

var LastIndex : int = 0;
var Length : int = 1; // 1 == single block mode
var DefaultLength : int = 3; // e.g. 3, 5, 7

private var Blocks : GameObject[]; // all blocks

var IsFalling : boolean = true;
var Moveable : boolean = true;
var Column : int = -1; // middle block column
var Row : int = -1; // middle block column

var BlocksReachedGround = 0;

private var Manager : BlockManager;

function Start() {
    Manager = GameObject.Find("_GM").GetComponent(BlockManager);
}

function InitBlocks() {
    IsFalling = true;
    Moveable = true;
    BlocksReachedGround = 0;
    LastIndex = 0;
    Blocks = new GameObject[Length];
    HasGroupReachedGround();
}

function Update () {
    if (Moveable == true) {
        if (Input.GetKeyDown(KeyCode.D) || Input.GetKeyDown(KeyCode.RightArrow)) { /// right
            MoveGroup(1);
        } else if (Input.GetKeyDown(KeyCode.A) || Input.GetKeyDown(KeyCode.LeftArrow)) { // left
            MoveGroup(-1);
        } 
        if (Length > 1) {
            if (Input.GetKeyDown(KeyCode.Q) || Input.GetKeyDown(KeyCode.Keypad7)) {
                Rotate(-1); // left
            } else if (Input.GetKeyDown(KeyCode.E) || Input.GetKeyDown(KeyCode.Keypad9)) {
                Rotate(-1); // right
            }
        }
    }
}

function MoveGroup (ColumnDir : int) {
    var CheckCount = 0;
    var CheckPositiveCount = 0; 
    if (Length > 1) {
        for (var i = 0; i < Length; i++) {
            if (Blocks[i] == null) continue;
            if (Blocks[i].GetComponent(BlockControl).MoveBlock(ColumnDir, true)) {
                CheckPositiveCount++;
            }
            CheckCount++;
        }
    }
    if (Length == 1 || CheckCount > 0 && CheckPositiveCount == CheckCount) {
        for (i = 0; i < Length; i++) {
            if (Blocks[i] == null) continue;
            Blocks[i].GetComponent(BlockControl).MoveBlock(ColumnDir, false);
        }
    }
}


function RotateBlock(i : int, rotation : int, mX : int, mY : int, possible : int, checkOnly : boolean) : int {
    var newX : int = -1;
    var newY : int = -1;

    var CurrentBlockControl : BlockControl = Blocks[i].GetComponent(BlockControl);

    if (CurrentBlockControl.Column != mX || CurrentBlockControl.Row != mY) {

        if (CurrentBlockControl.Column == mX) {
            // x/column values match
            newY = CurrentBlockControl.Row + ((mY - CurrentBlockControl.Row));
            newX = CurrentBlockControl.Column + ((mY - CurrentBlockControl.Row) * rotation);

        } else if (CurrentBlockControl.Row == mY) {
            // y/row values match
            newX = CurrentBlockControl.Column + ((mX - CurrentBlockControl.Column));
            newY = CurrentBlockControl.Row + ((mX - CurrentBlockControl.Column) * -rotation);
        }

        // Check for free block in field range, without real block rotation
        if (checkOnly == true) {
            if ((newX < 0 || newX >= Manager.BlockColumns || newY < 0 || newY >= Manager.BlockRows)
                || Manager.BlockPosFree(newX, newY) == false) {
                possible = 0;
            }

        } else {
            // Change block position for rotation
            CurrentBlockControl.SetBlockPos(newX, newY);
        }
    }

    if (i+1 < Length) {
        // rotate / check more blocks if available / needed
        possible = RotateBlock(i+1, rotation, mX, mY, possible, checkOnly);
    }

    return possible;
}

function Rotate(rotation : int) : boolean {

    // get middle group block for further process
    var midGroupPos : int = Mathf.Floor(Length / 2);
    var midGroupColumn : int = Blocks[midGroupPos].GetComponent(BlockControl).Column;
    var midGroupRow = Blocks[midGroupPos].GetComponent(BlockControl).Row;

    // Go throught blocks to validate target positions by rotation
    var possible : int = 1;
    possible = RotateBlock(0, rotation, midGroupColumn, midGroupRow, 1, true); // recursive

    if (possible == 1) {
        // Go throught blocks to change positions by rotation
        RotateBlock(0, rotation, midGroupColumn, midGroupRow, 1, false); // recursive

        GetComponent.<AudioSource>().clip = RotateGroupAudio;
        GetComponent.<AudioSource>().pitch = Random.Range (0.9, 1.1);
        GetComponent.<AudioSource>().Play();

        return true;
    }

    return false;
}

function HasGroupReachedGround() {
    IsFalling = !(BlocksReachedGround == Length);
    return !IsFalling;
}

function IncreaseBlocksReachedGround() {
    BlocksReachedGround++;
    Moveable = false;
    for (var i = 0; i < Length; i++) {
        if (Blocks[i] == null) continue;
        Blocks[i].GetComponent(BlockControl).Moveable = false;
    }
}

function AddBlock(CurrentBlock : GameObject) {
    Blocks[LastIndex] = CurrentBlock;
    LastIndex++;
}