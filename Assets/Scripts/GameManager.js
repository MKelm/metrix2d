#pragma strict

var IsGameOver : boolean = false;
var GameOverAudio : AudioClip;
var IncreaseScoreAudio : AudioClip;

var ScoreBoxOffsetY : float = 10.0f;
var ScoreBoxSizeX : float = 80.0f;
var ScoreBoxSizeY : float = 25.0f;

var TLBoxSizeX : float = 120.0f;
var TLBoxSizeY : float = 25.0f;

var R2RBoxSizeX : float = 120.0f;
var R2RBoxSizeY : float = 25.0f;

private var LocalScore : int = 0;
private var ScoreName : String = "";
private var ScoreSubmitted : boolean = false;
private var ShowHighscores : int = 0;
private var ShowSettings : boolean = false;

private var GameTime : float = 0;

private var EasyRider : boolean = false; // default false, classic 2008
private var GroupingAndRotation : boolean = false; // default true, classic 2008

private var LocalRoundScores : int[];
private var LocalRound : int = 0;
private var LocalPrevRoundsScore : int = 0;
private var HasRound2Round : boolean = false;
private var Round2RoundMaxRounds : int = 9;

private var BeatYourself : boolean = false;

private var HasTimeLimit : boolean = false;
private var TimeLimitMaxTime : int = 99;
private var LocalSeconds : float = 0;
private var Date = new Date();

var Active : boolean = false;
var Paused : boolean = false;

function Awake() {
    GameTime = GetGameTime(true);

    EasyRider = GetEasyRider(true);
    GroupingAndRotation = GetGroupingAndRotation(true);

    HasTimeLimit = GetHasTimeLimit(true);
    TimeLimitMaxTime = GetTimeLimitMaxTime(true);

    HasRound2Round = GetHasRound2Round(true);
    Round2RoundMaxRounds = GetRound2RoundMaxRounds(true);

    BeatYourself = GetBeatYourself(true);
}

function OnDisable() {
    SetGameTime(GameTime, true);
}

function Update() {
    if (Active == true) {
        if (Paused == false) {
            GameTime += Time.deltaTime;
            LocalSeconds += Time.deltaTime;
            if (!IsGameOver && HasTimeLimit && TimeLimitMaxTime > 0 && LocalSeconds > TimeLimitMaxTime) {
                GameOver(true);
            }
        }

        if (Paused == false || !IsGameOver) {
            if (Input.GetKey("escape")) {
                Application.Quit();
		
            } else if (Input.inputString == "\b") {
                // reset game
                Reset(0);
		
            } else if (Input.GetKey("f5")) {
                // show highscores table
                ShowHighscores = 2;
                Paused = true;

            } else if (Input.GetKey("f8")) {
                ShowSettings = true;
                Paused = true;
            }
        }
    }
}

function UpdateScores(nextRound : int) {
    var roundOk = true;
    if (nextRound == 0) {
        LocalScore = 0;
        LocalPrevRoundsScore = 0;
    } else if (HasRound2Round && Round2RoundMaxRounds > 0) {
        LocalPrevRoundsScore = 0;
        if (LocalRound > 0) {
            for (var i = 0; i < LocalRound; i++)
                LocalPrevRoundsScore += LocalRoundScores[i];
        }
        if (LocalRound < Round2RoundMaxRounds) {
            LocalRoundScores[LocalRound] = LocalScore - LocalPrevRoundsScore;
            LocalPrevRoundsScore = LocalPrevRoundsScore + LocalRoundScores[LocalRound];
        }
        if (LocalRound > 0 && LocalRound < Round2RoundMaxRounds) {
            if (BeatYourself && LocalRoundScores[LocalRound] <= LocalRoundScores[LocalRound-1]) {
                roundOk = false;
            }
        }
    }
    return roundOk;
}

function Reset(nextRound : int) {
    if (UpdateScores(nextRound)) {
        LocalRound = nextRound;
        LocalSeconds = 0;
        IsGameOver = false;
        GameObject.Find("_GM").GetComponent(BlockManager).ResetBlockField();
        Paused = false;
    } else {
        GameOver(false);
    }
}

function IncreaseScore() {
    if (!IsGameOver) {
        GetComponent.<AudioSource>().clip = IncreaseScoreAudio;
        GetComponent.<AudioSource>().pitch = Random.Range (0.9, 1.1);
        GetComponent.<AudioSource>().Play();
	
        LocalScore++;
    }
}

function GameOver(checkRound : boolean) {
    if (!IsGameOver) {
        if (checkRound == true) {
            if (HasRound2Round && Round2RoundMaxRounds > 0) {
                if (LocalRound < Round2RoundMaxRounds - 1) {
                    Reset(LocalRound + 1);
                    return;
                } else {
                    UpdateScores(LocalRound + 1);
                }
            }
        }
        
        GetComponent.<AudioSource>().clip = GameOverAudio;
        GetComponent.<AudioSource>().pitch = Random.Range (0.9, 1.1);
        GetComponent.<AudioSource>().Play();
	    
        IsGameOver = true;
        ShowHighscores = 1;
        Paused = true;
    }
}

function GetBeatYourself(prefs : boolean) {
    if (prefs === true && GameTime > 0) {
        BeatYourself = PlayerPrefs.GetInt("settingBeatYourself") == 1;
    }
    return BeatYourself;
}

function SetBeatYourself(newValue : boolean, prefs : boolean) {
    BeatYourself = newValue;
    if (prefs === true) {
        PlayerPrefs.SetInt("settingBeatYourself", BeatYourself ? 1 : 0);
    }
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
    if (Round2RoundMaxRounds > 0) {
        LocalRoundScores = new int[Round2RoundMaxRounds];
    }
    return Round2RoundMaxRounds;
}

function SetRound2RoundMaxRounds(newValue : int, prefs : boolean) {
    Round2RoundMaxRounds = newValue;
    if (prefs === true) {
        PlayerPrefs.SetInt("settingRound2RoundMaxRounds", Round2RoundMaxRounds);
    }
    LocalRound = 0;
    if (Round2RoundMaxRounds > 0) {
        LocalRoundScores = new int[Round2RoundMaxRounds];
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
    if (Active == true) {
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
            var WindowHeight2 = 7*25;
            var WindowRect2 = Rect( 
			    Screen.width/2-(Screen.width/4), Screen.height/2-WindowHeight2/2, Screen.width/2, WindowHeight2 
		    );
            GUILayout.Window(0, WindowRect2, AddSettingsForm, "Settings" );
        } else { // current score box
            var boxX = (BeatYourself && LocalRound > 0) ? ScoreBoxSizeX * 2 : ScoreBoxSizeX;
            GUI.Box (
			    new Rect(Screen.width/2-boxX/2, ScoreBoxOffsetY, boxX, ScoreBoxSizeY), 
			    (BeatYourself && LocalRound > 0) 
                ? "Score: " + LocalScore + " (" + (LocalScore - LocalPrevRoundsScore) + " / "+ LocalRoundScores[LocalRound-1] + ")":  "Score: " + LocalScore
		    );
            var TwoBottomBoxes = (HasRound2Round && HasTimeLimit);
            if (HasRound2Round && Round2RoundMaxRounds > 0) {
                GUI.Box (
			        new Rect(Screen.width/2-R2RBoxSizeX/2 - (TwoBottomBoxes ? TLBoxSizeX/2 + 10 : 0), 
                    Screen.height - R2RBoxSizeY - R2RBoxSizeY/2, R2RBoxSizeX, R2RBoxSizeY), 
			        "Round: " + (LocalRound + 1) + " / " + Round2RoundMaxRounds
		        );
            }
            if (HasTimeLimit && TimeLimitMaxTime > 0) {
                GUI.Box (
			        new Rect(Screen.width/2-TLBoxSizeX/2 + (TwoBottomBoxes ? R2RBoxSizeX/2 + 10 : 0), 
                    Screen.height - TLBoxSizeY - TLBoxSizeY/2, TLBoxSizeX, TLBoxSizeY), 
			        "Time Limit: " + Mathf.Floor(TimeLimitMaxTime - LocalSeconds)
		        );
            }
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
        GUI.Toggle(Rect(15, 45 + 25, Screen.width/4, 20), HasTimeLimit, " Time Limit, with max. time:"),
        true
    );
    GUILayout.EndHorizontal();

    GUILayout.Space(3 * 25); 
    GUILayout.BeginHorizontal();

    SetTimeLimitMaxTime(Mathf.Round(GUI.HorizontalSlider(new Rect(15, 95, Screen.width/3-15, 20), TimeLimitMaxTime, 0.0F, 99.0F)), true);
    GUI.Label(new Rect(Screen.width/3+15, 90, 50, 20), ""+GetTimeLimitMaxTime(false));
    GUILayout.EndHorizontal();

    GUILayout.BeginHorizontal();
    SetHasRound2Round(
        GUI.Toggle(Rect(15, 85 + 25, Screen.width/3, 20), HasRound2Round, " Round2Round, with max. rounds:"),
        true
    );
    GUILayout.EndHorizontal();

    GUILayout.Space(25);
    GUILayout.BeginHorizontal();

    SetRound2RoundMaxRounds(Mathf.Round(GUI.HorizontalSlider(new Rect(15, 135, Screen.width/3-15, 20), Round2RoundMaxRounds, 0.0F, 25.0F)), true);
    GUI.Label(new Rect(Screen.width/3+15, 130, 50, 20), ""+GetRound2RoundMaxRounds(false));
    GUILayout.EndHorizontal();

    GUILayout.BeginHorizontal();
    SetBeatYourself(
        GUI.Toggle(Rect(15, 125 + 25, Screen.width/4, 20), BeatYourself, " Beat Yourself"),
        true
    );
    GUILayout.EndHorizontal();

    GUILayout.Space(55);

    GUILayout.BeginHorizontal();
    if (GUILayout.Button("Close")) {
        Reset(0);
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
	    Reset(0);
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