let GV_GameLevel = 1;
let GV_UserSatisfaction = 100;
let GV_LevelTimeRemaining = Math.min(2 * 60 + GV_GameLevel * 30, 4 * 60);

// New clients remaining to spawn
let GV_NewClientsRemaining = Math.min(10 + 10 * GV_GameLevel, 50);

// Sound variables
let GV_ShouldPlaySfx = true;
let GV_ShouldPlayBgm = true;


