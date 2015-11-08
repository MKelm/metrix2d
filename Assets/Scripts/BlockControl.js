﻿#pragma strict

var MoveBlockAudio : AudioClip;

var IsFalling : boolean = true;
var FallsFromTop : boolean = true;
var IsChecked : boolean = false; // temp status while neighbor checks
var SpriteID : int = -1; // used to detect neighbors by color
var Column : int = -1;
var Row : int = -1;

function Update () {
	if (FallsFromTop == true) {
		if (Input.GetKeyDown(KeyCode.D) || Input.GetKeyDown(KeyCode.RightArrow)) { /// right
			MoveBlock(1);
		} else if (Input.GetKeyDown(KeyCode.A) || Input.GetKeyDown(KeyCode.LeftArrow)) { // left
			MoveBlock(-1);
		} else if (Input.GetKeyDown(KeyCode.S) || Input.GetKeyDown(KeyCode.DownArrow)) { // down
			// set rigidbody gravity scale
			GetComponent.<Rigidbody2D>().gravityScale = 10;
		}
	}
}

function MoveBlock (ColumnDir : int) {
	var mask : int = LayerMask.NameToLayer("Default");
	var direction : Vector2 = (ColumnDir == -1) ? -Vector2.right : Vector2.right;
	var blockSize : float = transform.GetComponent.<Renderer>().bounds.size.x;
	var topBorder = Vector2(
	  transform.position.x, transform.position.y - blockSize/2
	);
	var bottomBorder = Vector2(
	  transform.position.x, transform.position.y + blockSize/2
	);
	
	if (!Physics2D.Raycast(topBorder, direction, blockSize, 1 << mask) &&
	    !Physics2D.Raycast(bottomBorder, direction, blockSize, 1 << mask)) {
			   	
	   	Column = Column + ColumnDir;
	   	
	   	var FieldBGSize = GameObject.Find("_GM").GetComponent(GameSetup).FieldBG.GetComponent.<Renderer>().bounds.size;
		var ColumnSize = FieldBGSize.x / GameObject.Find("_GM").GetComponent(BlockManager).BlockColumns;
	   	transform.localPosition.x = (-1 * FieldBGSize.x / 2) + 
	   	  Column * ColumnSize + transform.GetComponent.<Renderer>().bounds.size.x/2;
	   	
	   	GetComponent.<AudioSource>().clip = MoveBlockAudio;
		GetComponent.<AudioSource>().pitch = Random.Range (0.9, 1.1);
		GetComponent.<AudioSource>().Play();
	}
}

function LateUpdate () {
	if (IsFalling == true) {
		GetComponent.<Rigidbody2D>().isKinematic = false;
	}
}

function OnCollisionStay2D (ColInfo : Collision2D) {

	if (IsFalling == true && 
	    (ColInfo.collider.name == "BottomWall" || ColInfo.collider.name == "Block(Clone)")) {
		
		// ignore some blocks because the detection is sometimes imprecise
		if (ColInfo.collider.name == "Block(Clone)") {
			var CBlockControl = ColInfo.gameObject.GetComponent(BlockControl);
			if (Column != CBlockControl.Column || (Row > -1 && CBlockControl.Row > Row)) {
			    // 1st: ignore collision with an side block to continue fall
			    // 2nd: ignore collision with an upper block to continue fall
				return;
			} else if (CBlockControl.IsFalling == true) {
				// ignore collision with a falling block to continue fall
				return;	     
			}
		}
		
		GetComponent.<Rigidbody2D>().isKinematic = true;
		IsFalling = false;
		
		var BlockManager = GameObject.Find("_GM").GetComponent(BlockManager);
		
		// set and get grid position for further calculations
		var gridPos : int[] = BlockManager.SetBlockInColumn (Column, gameObject);
		Row = gridPos[1];
		
		// correct block position to fit correct width/height of grid
		var FieldBGSize = GameObject.Find("_GM").GetComponent(GameSetup).FieldBG.GetComponent.<Renderer>().bounds.size;
		var RowSize = FieldBGSize.x / BlockManager.BlockColumns; // ColumnSize == RowSize
	   	transform.localPosition.y = (-1 * FieldBGSize.y / 2) + 
	   	  Row * RowSize + transform.GetComponent.<Renderer>().bounds.size.y/2;
		
		// get same sprites count in neighborhood
		var SpritesCount = BlockManager.CheckNeighbors(gridPos, SpriteID, 1, true, false);
		// reset is checked values and remove blocks if SpritesCount > 3
		var removeBlocks : boolean = (SpritesCount > 3);
		BlockManager.CheckNeighbors(gridPos, SpriteID, 1, false, removeBlocks);
		
		if (FallsFromTop == true) {
			FallsFromTop = false;
			GetComponent.<Rigidbody2D>().gravityScale = 10;
			// insert new block if last from top has reached the ground / grounding block
			BlockManager.InsertBlock();
		}
	}
}