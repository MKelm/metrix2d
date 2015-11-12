#pragma strict

var GameOverAudio : AudioClip;
var IncreaseScoreAudio : AudioClip;

var ScoreBoxOffsetY : float = 10.0f;
var ScoreBoxSizeX : float = 80.0f;
var ScoreBoxSizeY : float = 25.0f;

var TLBoxSizeX : float = 120.0f;
var TLBoxSizeY : float = 25.0f;

private var LocalScore : int = 0;
private var ScoreName : String = "";
private var ScoreSubmitted : boolean = false;
private var ShowHighscores : int = 0;
private var ShowSettings : boolean = false;

private var GameTime : float = 0;

private var EasyRider : boolean = false; // default false, classic 2008
private var GroupingAndRotation : boolean = false; // default true, classic 2008

private var HasRound2Round : boolean = false;
private var Round2RoundMaxRounds : int = 9;

private var HasTimeLimit : boolean = false;
private var TimeLimitMaxTime : int = 99;
private var LocalSeconds : float = 0;
private var Date = new Date();

function Awake() {
    GameTime = GetGameTime(true);

    EasyRider = GetEasyRider(true);
    GroupingAndRotation = GetGroupingAndRotation(true);

    HasTimeLimit = GetHasTimeLimit(true);
    TimeLimitMaxTime = GetTimeLimitMaxTime(true);

    HasRound2Round = GetHasRound2Round(true);
    Round2RoundMaxRounds = GetRound2RoundMaxRounds(true);
}

function OnDisable() {
    SetGameTime(GameTime, true);
}

function Update() {
    GameTime += Time.deltaTime;

    if (ShowSettings != true || ShowHighscores > 0) {
        if (ShowHighscores == 0) {
            LocalSeconds += Time.deltaTime;
            if (HasTimeLimit && TimeLimitMaxTime > 0 && LocalSeconds > TimeLimitMaxTime) {
                GameOver();
            }
        }
    
        if (Input.GetKey("escape")) {
            Application.Quit();
		
        } else if (Input.inputString == "\b") {
            // reset game
            Reset();
		
        } else if (Input.GetKey("f5")) {
            // show highscores table
            ShowHighscores = 2;
        } else if (Input.GetKey("f8")) {
            ShowSettings = true;
        }
    }
}

function Reset() {
    LocalScore = 0;
    LocalSeconds = 0;
    GameObject.Find("_GM").GetComponent(BlockManager).ResetBlockField();
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

function GetGameTime(prefs : boolean) {
    if (prefs === true) {
        GameTime = PlayerPrefs.GetFloat("gameTime");
    }
    return GameTime;
}

function SetGameTime(newValue : float, prefs : boolean) {
    GameTime = newValue;
    if (prefs === true) {
        PlayerPrefs.SetFloat("gameTime", GameTime);
    }
}

function GetHasRound2Round(prefs : boolean) {
    if (prefs === true && GameTime > 0) {
        HasRound2Round = PlayerPrefs.GetInt("settingHasRound2Round") == 1;
    }
    return HasRound2Round;
}

function SetHasRound2Round(newValue : boolean, prefs : boolean) {
    HasRound2Round = newValue;
    if (prefs === true) {
        PlayerPrefs.SetInt("settingHasRound2Round", HasRound2Round ? 1 : 0);
    }
}

function GetRound2RoundMaxRounds(prefs : boolean) {
    if (prefs === true && GameTime > 0) {
        Round2RoundMaxRounds = PlayerPrefs.GetInt("settingRound2RoundMaxRounds");
    }
    return Round2RoundMaxRounds;
}

function SetRound2RoundMaxRounds(newValue : int, prefs : boolean) {
    Round2RoundMaxRounds = newValue;
    if (prefs === true) {
        PlayerPrefs.SetInt("settingRound2RoundMaxRounds", Round2RoundMaxRounds);
    }
}

function GetHasTimeLimit(prefs : boolean) {
    if (prefs === true && GameTime > 0) {
        HasTimeLimit = PlayerPrefs.GetInt("settingHasTimeLimit") == 1;
    }
    return HasTimeLimit;
}

function SetHasTimeLimit(newValue : boolean, prefs : boolean) {
    HasTimeLimit = newValue;
    if (prefs === true) {
        PlayerPrefs.SetInt("settingHasTimeLimit", HasTimeLimit ? 1 : 0);
    }
}

function GetTimeLimitMaxTime(prefs : boolean) {
    if (prefs === true && GameTime > 0) {
        TimeLimitMaxTime = PlayerPrefs.GetInt("settingTimeLimitMaxTime");
    }
    return TimeLimitMaxTime;
}

function SetTimeLimitMaxTime(newValue : int, prefs : boolean) {
    TimeLimitMaxTime = newValue;
    if (prefs === true) {
        PlayerPrefs.SetInt("settingTimeLimitMaxTime", TimeLimitMaxTime);
    }
}

function GetEasyRider(prefs : boolean) {
    if (prefs === true && GameTime > 0) {
        EasyRider = PlayerPrefs.GetInt("settingEasyRider") == 1;
    }
    return EasyRider;
}

 function SetEasyRider(newValue : boolean, prefs : boolean) {
    EasyRider = newValue;
    if (prefs === true) {
        PlayerPrefs.SetInt("settingEasyRider", EasyRider ? 1 : 0);
    }
}

function GetGroupingAndRotation(prefs : boolean) {
    if (prefs === true && GameTime > 0) {
        GroupingAndRotation = PlayerPrefs.GetInt("settingGroupingAndRotation") == 1;
    }
    return GroupingAndRotation;
}

function SetGroupingAndRotation(newValue : boolean, prefs : boolean) {
    GroupingAndRotation = newValue;
    if (prefs === true) {
        PlayerPrefs.SetInt("settingGroupingAndRotation", GroupingAndRotation ? 1 : 0);
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
		if (HasTimeLimit && TimeLimitMaxTime > 0) {
		    GUI.Box (
			    new Rect(Screen.width/2-TLBoxSizeX/2, Screen.height - TLBoxSizeY - ScoreBoxSizeY/2, TLBoxSizeX, TLBoxSizeY), 
			    "Time Limit: " + Mathf.Floor(TimeLimitMaxTime - LocalSeconds)
		    );
		}
	}
}

function AddSettingsForm(windowID : int) {
    GUILayout.BeginVertical();

    GUILayout.BeginHorizontal();
    SetEasyRider(
        GUI.Toggle(Rect(15, 20, Screen.width/4, 20), EasyRider, " Easy Rider"),
        true
    );
    GUILayout.EndHorizontal();

    GUILayout.BeginHorizontal();
    SetGroupingAndRotation(
        GUI.Toggle(Rect(15, 20 + 25, Screen.width/4, 20), GroupingAndRotation, " Grouping & Rotation"),
        true
    );
    GUILayout.EndHorizontal();

    GUILayout.BeginHorizontal();
    SetHasTimeLimit(
        GUI.Toggle(Rect(15, 45 + 25, Screen.width/4, 20), HasTimeLimit, " Time Limit"),
        true
    );
    GUILayout.EndHorizontal();

    GUILayout.Space(3 * 25);
    GUILayout.BeginHorizontal();
    try {
        SetTimeLimitMaxTime( int.Parse(GUILayout.TextField(""+ TimeLimitMaxTime)), true);
    } catch(err) {
        SetTimeLimitMaxTime(0, true);
    }
    GUILayout.EndHorizontal();

    GUILayout.BeginHorizontal();
    SetHasRound2Round(
        GUI.Toggle(Rect(15, 100 + 25, Screen.width/4, 20), HasRound2Round, " Round2Round"),
        true
    );
    GUILayout.EndHorizontal();

    GUILayout.Space(25);
    GUILayout.BeginHorizontal();
    try {
        SetRound2RoundMaxRounds( int.Parse(GUILayout.TextField(""+ Round2RoundMaxRounds)), true);
    } catch(err) {
        SetRound2RoundMaxRounds(0, true);
    }
    GUILayout.EndHorizontal();

    GUILayout.Space(5);

    GUILayout.BeginHorizontal();
    if (GUILayout.Button("Close")) {
        Reset();
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
	    Reset();
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