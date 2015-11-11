#pragma strict

var BlockPrefab : Transform;
var BlockColumns : int = 8;

var BlockSprites : Sprite[];

private var BlockRows : int = -1;
private var BlockInRows : GameObject[,];
private var BlockGravityScale : float = 0.1f;

private var Manager : GameManager;

function Start () {
    Manager = GameObject.Find("_GM").GetComponent(GameManager);

	InsertBlock ();
}

function Update () {
	if (BlockRows > -1) {
	    
		// check / change grid position of blocks which falls from bottom to top
		for (var c = 0; c < BlockColumns; c++) {
			for (var r = 0; r < BlockRows - 1; r++) {
				if (BlockInRows[c, r] == null && BlockInRows[c, r+1] != null) {
                    // set block to fall mode if possible
					BlockInRows[c, r+1].GetComponent(BlockControl).IsFalling = true;
					BlockInRows[c, r+1] = null;
				}
			}
		}
	}
}

function ResetBlockField () {
	for (var GObj : GameObject in GameObject.FindGameObjectsWithTag("Block")) {
		Destroy(GObj);
	}
	for (var c = 0; c < BlockColumns; c++) {
		for (var r = 0; r < BlockRows; r++) {
			BlockInRows[c, r] = null;
		}
	}
	InsertBlock();
}

// check all neighbors of block by grid position to remove chains
function CheckNeighbors(
			GridPos : int[], SpriteID : int, SpritesCount : int, SetIsChecked : boolean, RemoveBlocks : boolean
		 ) : int {
	if (GridPos[0] < 0 || GridPos[1] < 0 || GridPos[0] >= BlockColumns || GridPos[1] >= BlockRows) return SpritesCount;
	
	BlockInRows[GridPos[0], GridPos[1]].GetComponent(BlockControl).IsChecked = SetIsChecked;

	// check left column neighbor as same sprite color if possible
	if (GridPos[0] > 0 && BlockInRows[GridPos[0]-1, GridPos[1]] != null &&
		BlockInRows[GridPos[0]-1, GridPos[1]].GetComponent(BlockControl).SpriteID == SpriteID &&
		BlockInRows[GridPos[0]-1, GridPos[1]].GetComponent(BlockControl).IsChecked == !SetIsChecked) {
	  SpritesCount++;
	  SpritesCount = CheckNeighbors([GridPos[0]-1, GridPos[1]], SpriteID, SpritesCount, SetIsChecked, RemoveBlocks);
	}
	
	// check right column neighbor as same sprite color if possible
	if (GridPos[0]+1 < BlockColumns && BlockInRows[GridPos[0]+1, GridPos[1]] != null &&
		BlockInRows[GridPos[0]+1, GridPos[1]].GetComponent(BlockControl).SpriteID == SpriteID &&
		BlockInRows[GridPos[0]+1, GridPos[1]].GetComponent(BlockControl).IsChecked == !SetIsChecked) {
	  SpritesCount++;
	  SpritesCount = CheckNeighbors([GridPos[0]+1, GridPos[1]], SpriteID, SpritesCount, SetIsChecked, RemoveBlocks);
	}
	
	// check top row neighbor as same sprite color if possible
	if (GridPos[1]+1 < BlockRows && BlockInRows[GridPos[0], GridPos[1]+1] != null &&
		BlockInRows[GridPos[0], GridPos[1]+1].GetComponent(BlockControl).SpriteID == SpriteID &&
		BlockInRows[GridPos[0], GridPos[1]+1].GetComponent(BlockControl).IsChecked == !SetIsChecked) {
	  SpritesCount++;
	  SpritesCount = CheckNeighbors([GridPos[0], GridPos[1]+1], SpriteID, SpritesCount, SetIsChecked, RemoveBlocks);
	}
	
	// check bottom row neighbor as same sprite color if possible
	if (GridPos[1]-1 >= 0 && BlockInRows[GridPos[0], GridPos[1]-1] != null &&
		BlockInRows[GridPos[0], GridPos[1]-1].GetComponent(BlockControl).SpriteID == SpriteID &&
		BlockInRows[GridPos[0], GridPos[1]-1].GetComponent(BlockControl).IsChecked == !SetIsChecked) {
	  SpritesCount++;
	  SpritesCount = CheckNeighbors([GridPos[0], GridPos[1]-1], SpriteID, SpritesCount, SetIsChecked, RemoveBlocks);
	}
	
	// remove blocks in remove mode
	if (RemoveBlocks == true) {
		Destroy(BlockInRows[GridPos[0], GridPos[1]]);
		BlockInRows[GridPos[0], GridPos[1]] = null;
		
		Manager.IncreaseScore();
	}
	
	// collect 4 neighbors to remove same block sprites later
	return SpritesCount;
}

function InsertBlock () {
	var _GS = GameObject.Find("_GM").GetComponent(GameSetup);
	
	var InsertFailed = false;
	var Column = -1;
	if (Manager.GetLastBlockStanding(false) === false) {
		// one try to insert block to a random column (harder, classic 2008)
		Column = Random.Range(0, BlockColumns);
		if (IsFreeSpaceInColumn(Column) == false) {
			InsertFailed = true;
		}
	} else {
		// search for free column, max. 100 tries (easier, new 2014)
		var Iteration = 0;
		do {
		  Column = Random.Range(0, BlockColumns);
		  Iteration++;
		} while (Iteration < 100 && IsFreeSpaceInColumn(Column) == false);
		if (Iteration >= 100) { 
			InsertFailed = true;
		}
	}
	if (InsertFailed === true) {
	    Manager.GameOver();
		return;
	}

	var FieldBGSize = _GS.FieldBG.GetComponent.<Renderer>().bounds.size;
	var ColumnSize = FieldBGSize.x / BlockColumns;
	
	var newBlock = Instantiate (BlockPrefab, new Vector3(0f, 0f, 0f), Quaternion.Euler(Vector3(0, 0, 0)) );
	newBlock.localScale.x = _GS.FieldBG.localScale.x / BlockColumns;
	newBlock.localScale.y = newBlock.localScale.x;
	
	// use block size with a small correction value for the box collider
	newBlock.GetComponent(BoxCollider2D).size = new Vector2(
	  newBlock.GetComponent.<Renderer>().bounds.size.x / newBlock.localScale.x - newBlock.localScale.x / 300,
	  newBlock.GetComponent.<Renderer>().bounds.size.y / newBlock.localScale.y - newBlock.localScale.y / 300
	);
	
	newBlock.localPosition.x = (-1 * FieldBGSize.x / 2) + Column * ColumnSize + newBlock.GetComponent.<Renderer>().bounds.size.x/2;
	newBlock.localPosition.y = FieldBGSize.y / 2 - newBlock.GetComponent.<Renderer>().bounds.size.y/2;
	
	var BlockSpriteId = Random.Range(0, BlockSprites.Length);
	newBlock.GetComponent(SpriteRenderer).sprite = BlockSprites[BlockSpriteId];
	var BlockControl = newBlock.GetComponent(BlockControl);
	BlockControl.SpriteID = BlockSpriteId;
	BlockControl.Column = Column;
	BlockControl.FallsFromTop = true;
	
	if (BlockRows == -1) {
		BlockRows = Mathf.Floor(FieldBGSize.y / newBlock.GetComponent.<Renderer>().bounds.size.y);
		BlockInRows = new GameObject[BlockColumns, BlockRows];
	}
   
	newBlock.GetComponent.<Rigidbody2D>().gravityScale = BlockGravityScale;
	BlockGravityScale += 0.02;
}

// set block if he has reached the next ground / grounding block
function SetBlockInColumn (Column : int, BlockObj : GameObject) : int[] {
    var Row = GetNextFreeRowInColumn(Column);
    if (Row == -1) return [-1, -1];
	BlockInRows[Column, Row] = BlockObj;
	return [Column, Row];
}

function GetNextFreeRowInColumn (Column : int) : int {
	for (var i = 0; i < BlockRows; i++) {
		if (BlockInRows[Column, i] == null) {
			return i;
		}
	}
	return -1;
}

function IsFreeSpaceInColumn (Column : int) {
	var BlockCount = 0;
	for (var i = 0; i < BlockRows; i++) {
		if (BlockInRows[Column, i] != null) {
			BlockCount++;
		}
	}
	if (BlockCount == BlockRows) return false;
	return true;
}