#pragma strict

var mainCam : Camera;

var topWall : BoxCollider2D;
var bottomWall : BoxCollider2D;
var leftWall : BoxCollider2D;
var rightWall : BoxCollider2D;

var FieldBG : Transform;
var FieldBGScreenAmount : float = 0.5f;

var FullBG : Transform;

function Awake () {
	//Move each wall to its edge location
	topWall.size = new Vector2 ( 
		mainCam.ScreenToWorldPoint (new Vector3(Screen.width * 2f, 0f, 0f)).x, 1f
	);
	topWall.offset = new Vector2 (
		0f, mainCam.ScreenToWorldPoint (new Vector3 (0f, Screen.height, 0f)).y + 0.5f
	);
	
	bottomWall.size = new Vector2 ( 
		mainCam.ScreenToWorldPoint (new Vector3(Screen.width * 2f, 0f, 0f)).x, 1f
	);
	bottomWall.offset = new Vector2 (
		0f, mainCam.ScreenToWorldPoint (new Vector3 (0f, 0f, 0f)).y - 0.5f
	);
	
	leftWall.size = new Vector2 ( 
		1f, mainCam.ScreenToWorldPoint (new Vector3(0f, Screen.height * 2f, 0f)).y
	);
	leftWall.offset = new Vector2 (
		mainCam.ScreenToWorldPoint (
			new Vector3 (0f + Screen.width * 0.5 - Screen.width * FieldBGScreenAmount / 2, 0f, 0f)
		).x - 0.5f, 0f
	);
	
	rightWall.size = new Vector2 ( 
		1f, mainCam.ScreenToWorldPoint (new Vector3(0f, Screen.height * 2f, 0f)).y
	);
	rightWall.offset = new Vector2 (
		mainCam.ScreenToWorldPoint (
			new Vector3 (Screen.width - Screen.width * 0.5 + Screen.width * FieldBGScreenAmount / 2, 0f, 0f)
		).x + 0.5f, 0f
	);
	
	//scale field background correctly
	FieldBG.localScale.x = (rightWall.offset.x - leftWall.offset.x - 1f) / FieldBG.GetComponent.<Renderer>().bounds.size.x;	
	FieldBG.localScale.y = (bottomWall.offset.y - topWall.offset.y + 1f) / FieldBG.GetComponent.<Renderer>().bounds.size.y;
	
	//scale full background correctly	
	var leftBorderX : float = mainCam.ScreenToWorldPoint (new Vector3 (0f, 0f, 0f)).x;
	var rightBorderX : float = mainCam.ScreenToWorldPoint (new Vector3 (Screen.width, 0f, 0f)).x;
		
	FullBG.localScale.x = (rightBorderX - leftBorderX) / FullBG.GetComponent.<Renderer>().bounds.size.x;
	FullBG.localScale.y = (bottomWall.offset.y - topWall.offset.y + 1f) / FullBG.GetComponent.<Renderer>().bounds.size.y;
	
}