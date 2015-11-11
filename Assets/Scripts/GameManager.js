#pragma strict

var GameOverAudio : AudioClip;
var IncreaseScoreAudio : AudioClip;

var ScoreBoxOffsetY : float = 10.0f;
var ScoreBoxSizeX : float = 80.0f;
var ScoreBoxSizeY : float = 25.0f;

private var LocalScore : int = 0;
private var ScoreName : String = "";
private var ScoreSubmitted : boolean = false;
private var ShowHighscores : int = 0;
private var ShowSettings : boolean = false;

private var LastBlockStanding : boolean = false; // default false, classic 2008
private var BlockGroupRotation : boolean = false; // default true, classic 2008 (not finished yet)

function Awake() {
    LastBlockStanding = GetLastBlockStanding(true);
    BlockGroupRotation = GetBlockGroupRotation(true);
}

function Update() {
	if (Input.GetKey("escape")) {
		Application.Quit();
		
	} else if (Input.inputString == "\b") {
		// reset game
		LocalScore = 0;
		GameObject.Find("_GM").GetComponent(BlockManager).ResetBlockField();
		
	} else if (Input.GetKey("f5")) {
		// show / hide highscores table
		ShowHighscores = 2;
	} else if (Input.GetKey("f8")) {
	    ShowSettings = true;
	}
}

function IncreaseScore() {
	GetComponent.<AudioSource>().clip = IncreaseScoreAudio;
	GetComponent.<AudioSource>().pitch = Random.Range (0.9, 1.1);
	GetComponent.<AudioSource>().Play();
	
	LocalScore++;
}

function GameOver() {
    GetComponent.<AudioSource>().clip = GameOverAudio;
	GetComponent.<AudioSource>().pitch = Random.Range (0.9, 1.1);
	GetComponent.<AudioSource>().Play();
	
	ShowHighscores = 1;
}

function GetLastBlockStanding(prefs : boolean) {
    if (prefs === true) {
        LastBlockStanding = PlayerPrefs.GetInt("settingLastBlockStanding") == 1;
    }
    return LastBlockStanding;
}

function SetLastBlockStanding(newValue : boolean, prefs : boolean) {
    LastBlockStanding = newValue;
    if (prefs === true) {
        PlayerPrefs.SetInt("settingLastBlockStanding", LastBlockStanding ? 1 : 0);
    }
}

function GetBlockGroupRotation(prefs : boolean) {
    if (prefs === true) {
        BlockGroupRotation = PlayerPrefs.GetInt("settingBlockGroupRotation") == 1;
    }
    return BlockGroupRotation;
}

function SetBlockGroupRotation(newValue : boolean, prefs : boolean) {
    BlockGroupRotation = newValue;
    if (prefs === true) {
        PlayerPrefs.SetInt("settingBlockGroupRotation", BlockGroupRotation ? 1 : 0);
    }
}


function OnGUI() {
	if (ShowHighscores == 1) { // add highscore window
		var WindowHeight0 = 100;
		var WindowRect0 = Rect( 
			Screen.width/2-(Screen.width/4), Screen.height/2-WindowHeight0/2, Screen.width/2, WindowHeight0 
		);
    	GUILayout.Window(0, WindowRect0, AddHighscoreForm, "Add Highscore" );
     	if (ScoreSubmitted) {
     		ScoreSubmitted = false;
     		AddScore(ScoreName, LocalScore);
     		ShowHighscores = 2;
     	}
	} else if (ShowHighscores == 2) { // highscores list
	    var WindowHeight1 = 10*35;
	    var WindowRect1 = Rect( 
			Screen.width/2-(Screen.width/4), Screen.height/2-WindowHeight1/2, Screen.width/2, WindowHeight1 
		);
	    GUILayout.Window(0, WindowRect1, AddHighscoresTable, "Highscores" );
	} else if (ShowSettings == true) {
	    var WindowHeight2 = 1*35;
	    var WindowRect2 = Rect( 
			Screen.width/2-(Screen.width/4), Screen.height/2-WindowHeight2/2, Screen.width/2, WindowHeight2 
		);
	    GUILayout.Window(0, WindowRect2, AddSettingsForm, "Settings" );
	} else { // current score box
		GUI.Box (
			new Rect(Screen.width/2-ScoreBoxSizeX/2, ScoreBoxOffsetY, ScoreBoxSizeX, ScoreBoxSizeY), 
			"Score: " + LocalScore
		);
	}
}

function AddSettingsForm(windowID : int) {
    GUILayout.BeginVertical();

    GUILayout.BeginHorizontal();
    SetLastBlockStanding(
        GUI.Toggle(Rect(15, 20, Screen.width/4, 20), LastBlockStanding, "Last Block Standing"),
        true
    );
    GUILayout.EndHorizontal();

    GUILayout.BeginHorizontal();
    SetBlockGroupRotation(
        GUI.Toggle(Rect(15, 20 + 20, Screen.width/4, 20), BlockGroupRotation, "Block Group & Rotation"),
        true
    );
    GUILayout.EndHorizontal();

    GUILayout.Space(2 * 20);

    GUILayout.BeginHorizontal();
    if (GUILayout.Button("Close")) {
        ShowSettings = false;
    }
    GUILayout.EndHorizontal();

    GUILayout.EndVertical();
}

function AddHighscoresTable(windowID : int) {
	GUILayout.BeginVertical();
	
	for (var i = 0; i < 10; i++) {
		GUILayout.Space(5);
		var CScore = PlayerPrefs.GetInt (i+"HScore");
		if (CScore > 0) {
			GUILayout.BeginHorizontal();
			GUILayout.Label(PlayerPrefs.GetString (i+"HScoreName"), GUILayout.Width(Screen.width/4));
			GUILayout.Label("" + CScore, GUILayout.Width(Screen.width/4));
			GUILayout.EndHorizontal();
		}
	}

	GUILayout.Space(5);
	GUILayout.BeginHorizontal();
	if (GUILayout.Button("Close")) {
	    ShowHighscores = 0;
	}
	GUILayout.EndHorizontal();
    
	GUILayout.EndVertical();
}

function AddHighscoreForm(windowID : int) {
 	GUILayout.BeginVertical();
 	
 	GUILayout.Space(5);
 	
	GUILayout.BeginHorizontal();
    GUILayout.Label("Name", GUILayout.Width(80));
    ScoreName = GUILayout.TextField(ScoreName);
    GUILayout.EndHorizontal();
    
    GUILayout.Space(5);
    
    if (GUILayout.Button( "Submit" )) {
        ScoreSubmitted = true;
    }
    GUILayout.EndVertical();
}

function AddScore(name : String, score : int) {
   var newScore : int;
   var newName : String;
   var oldScore : int;
   var oldName : String;
   newScore = score;
   newName = name;
   for (var i = 0; i < 10; i++) {
      if (PlayerPrefs.HasKey(i+"HScore")) {
         if (PlayerPrefs.GetInt(i+"HScore") < newScore) { 
            // new score is higher than the stored score
            oldScore = PlayerPrefs.GetInt (i+"HScore");
            oldName = PlayerPrefs.GetString (i+"HScoreName");
            PlayerPrefs.SetInt (i+"HScore", newScore);
            PlayerPrefs.SetString (i+"HScoreName", newName);
            newScore = oldScore;
            newName = oldName;
         }
      } else {
         PlayerPrefs.SetInt (i+"HScore", newScore);
         PlayerPrefs.SetString (i+"HScoreName", newName);
         newScore = 0;
         newName = "";
      }
   }
}