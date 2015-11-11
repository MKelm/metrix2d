#pragma strict

var LastIndex : int = 0;
var Length : int = 3; // e.g. 3, 5, 7 or 1 without BlockGroupRotation for single block mode

private var Blocks : GameObject[]; // all blocks

var IsFalling : boolean = true;
var Column : int = -1; // middle block column
var Row : int = -1; // middle block column

var BlocksReachedGround = 0;

function InitBlocks() {
    Debug.Log("init blocks");
    BlocksReachedGround = 0;
    LastIndex = 0;
    Blocks = new GameObject[Length];
    HasGroupReachedGround();
}

function HasGroupReachedGround() {
    IsFalling = !(BlocksReachedGround == Length);
    Debug.Log("group reached ground? " + BlocksReachedGround + " / " + Length);
    return !IsFalling;
}

function IncreaseBlocksReachedGround() {
    BlocksReachedGround++;
    for (var i = 0; i < Length; i++) {
        Blocks[i].GetComponent(BlockControl).Moveable = false;
    }
}

function AddBlock(CurrentBlock : GameObject) {
    Blocks[LastIndex] = CurrentBlock;
    LastIndex++;
    Debug.Log(" add block in group " + LastIndex);
}