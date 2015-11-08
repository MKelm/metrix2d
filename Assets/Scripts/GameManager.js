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

function Update () {
	if (Input.GetKey ("escape") || Input.GetButtonDown("Fire3")) {
		Application.Quit();
		
	} else if (Input.inputString == "\b" || Input.GetButtonDown("Fire2")) {
		// reset game
		LocalScore = 0;
		GameObject.Find("_GM").GetComponent(BlockManager).ResetBlockField();
		
	} else if (Input.GetButtonDown("Fire1")) {
		// show / hide highscores table
		if (ShowHighscores == 2) {
			ShowHighscores = 0;
		} else if (ShowHighscores == 0) {
			ShowHighscores = 2;
		}
	}
}

function IncreaseScore() {
	audio.clip = IncreaseScoreAudio;
	audio.pitch = Random.Range (0.9, 1.1);
	audio.Play();
	
	LocalScore++;
}

function GameOver () {
    audio.clip = GameOverAudio;
	audio.pitch = Random.Range (0.9, 1.1);
	audio.Play();
	
	ShowHighscores = 1;
}

function OnGUI () {
	if (ShowHighscores == 1) { // add highscore window
		var WindowHeight0 = 100;
		var WindowRect0 = Rect( 
			Screen.width/2-(Screen.width/4), Screen.height/2-WindowHeight0/2, Screen.width/2, WindowHeight0 
		);
    	GUILayout.Window(0, WindowRect0, AddHighscoreForm, "Add Highscore" );
     	if (ScoreSubmitted) {
     		AddScore(ScoreName, LocalScore);
     		ShowHighscores = 2;
     	}
	} else if (ShowHighscores == 2) { // highscores list
		var WindowHeight1 = 10*35;
		var WindowRect1 = Rect( 
			Screen.width/2-(Screen.width/4), Screen.height/2-WindowHeight1/2, Screen.width/2, WindowHeight1 
		);
    	GUILayout.Window(0, WindowRect1, AddHighscoresTable, "Highscores" );
	} else { // current score box
		GUI.Box (
			new Rect (Screen.width/2-ScoreBoxSizeX/2, ScoreBoxOffsetY, ScoreBoxSizeX, ScoreBoxSizeY), 
			"Score: " + LocalScore
		);
	}
}

function AddHighscoresTable (windowID : int) {
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

	GUILayout.EndVertical();
}

function AddHighscoreForm (windowID : int) {
 	GUILayout.BeginVertical();
 	
 	GUILayout.Space(5);
 	
	GUILayout.BeginHorizontal();
    GUILayout.Label("Name", GUILayout.Width(80));
    ScoreName = GUILayout.TextField( ScoreName );
    GUILayout.EndHorizontal();
    
    GUILayout.Space(5);
    
    if (GUILayout.Button( "Submit" )) {
        ScoreSubmitted = true;
    }
    GUILayout.EndVertical();
}

function AddScore (name : String, score : int) {
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