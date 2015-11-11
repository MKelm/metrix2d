#pragma strict

var LastIndex : int = 0;
var Length : int = 3; // e.g. 3, 5, 7 or 1 without BlockGroupRotation for single block mode

private var Blocks : GameObject[]; // all blocks

var IsFalling : boolean = true;
var Moveable : boolean = true;
var Column : int = -1; // middle block column
var Row : int = -1; // middle block column

var BlocksReachedGround = 0;

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
        if (Input.GetKeyDown(KeyCode.S) || Input.GetKeyDown(KeyCode.DownArrow)) { // down
            for (var i = 0; i < Length; i++) {
                if (Blocks[i] == null) continue;
                Blocks[i].GetComponent(BlockControl).SetGravityScale(10);
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