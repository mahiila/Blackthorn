const $ = (id) => document.getElementById(id);
const CLUES = {
  guestbook: "Mara's hidden message",
  chapel: "Rook's old badge",
  drawing: "The faceless drawing",
  mirror: "The mirror with no reflection",
  archive: "The name of Rook's sister"
};
const ALL_ROOMS = ["guestbook", "chapel", "drawing", "mirror", "archive"];
function shuffle(list) {
  const a = [...list];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
let game; 
function newGame() {
  game = {
    rooms: shuffle(ALL_ROOMS).slice(0, 3),
    clues: [],         
    lostClues: [],      
    visited: [],      
    prices: [],         
    rookGone: false,   
    voiceLost: false,   
    candleDimmed: false,
    bloodLost: false,  
    rookKnows: false,   
    notice: ""          
  };
}
function isOpen(id) {
  return game.rooms.includes(id) && !game.visited.includes(id);
}
// ----------  THE CASTLE'S PRICE ----------
const PRICES = {
  "Blood": () => {
    game.bloodLost = true;
    return "THE CASTLE HAS TAKEN YOUR BLOOD.\nYour hands shake. Your body feels weaker.";
  },
  "Light": () => {
    game.candleDimmed = true;
    return "THE CASTLE HAS TAKEN YOUR LIGHT.\nYour candle gutters. The darkness leans closer.";
  },
  "A Friend": () => {
    game.rookGone = true;
    return "THE CASTLE HAS TAKEN A FRIEND.\nRook steps back into the dark. “I can't follow you any farther.”";
  },
  "Your Voice": () => {
    game.voiceLost = true;
    return "THE CASTLE HAS TAKEN YOUR VOICE.\nYou open your mouth. No sound comes out.";
  },
  "A Memory": (newClue) => {
    const old = game.clues.filter((c) => c !== newClue);
    if (old.length === 0) {
      return "THE CASTLE HAS TAKEN A MEMORY.\nYou feel a hole in your mind, but there was nothing important to lose... yet.";
    }
    const lost = old[Math.floor(Math.random() * old.length)];
    game.clues = game.clues.filter((c) => c !== lost);
    game.lostClues.push(lost);
    return "THE CASTLE HAS TAKEN A MEMORY.\nYou can no longer remember: " + CLUES[lost] + ".";
  }
};
function takePrice(newClue) {
  const left = Object.keys(PRICES).filter((name) => !game.prices.includes(name));
  const name = left[Math.floor(Math.random() * left.length)];
  game.prices.push(name);
  return PRICES[name](newClue);
}
function findClue(id) {
  game.visited.push(id);
  game.clues.push(id);
  game.notice = "CLUE FOUND: " + CLUES[id] + "\n\nA price must be paid.\n" + takePrice(id);
}
// ---------- THE STORY ----------
const scenes = {
  start: {
    label: "CHAPTER 1",
    place: "THE VILLAGE, BELOW THE HILL",
    title: "The Cracked Lantern",
    text:
      "You wake in a chair with your mother's lantern in your lap. The glass is cracked, and you don't remember why.\n\n" +
      "Three nights ago, your oldest friend, Mara, disappeared. She was the one person who always trusted you. A year ago something broke that trust. Neither of you ever spoke of it again.\n\n" +
      "She was last seen walking toward Blackthorn Castle, an abandoned castle on the hill. Nobody in the village goes near it. But every few months, someone disappears, and every time, the castle's front door is found open the next morning.\n\n" +
      "The night Mara vanished, a letter arrived in her handwriting:\n\n" +
      "“If you come looking for me, bring a candle. Don't bring anyone you trust. And whatever happens, don't let Rook open the red door.”\n\n" +
      "You have no idea who Rook is.",
    choices: [
      { text: "Enter Blackthorn Castle with a candle in the cracked lantern", go: "hall" }
    ]
  },
  hall: {
    label: "CHAPTER 1",
    place: "BLACKTHORN CASTLE · THE ENTRANCE",
    title: "The Man at the End of the Hall",
    text:
      "Just before midnight, you step inside. The door slams shut behind you.\n\n" +
      "A man stands at the end of the hallway. He wears an old guard's uniform, and his face looks like someone who hasn't slept in years. He stares at your lantern.\n\n" +
      "“You came back,” he says. “You asked it to take something from you. I watched.”\n\n" +
      "His name is Rook. When you ask where Mara is, he says, “She's alive. At least, I think she is.”\n\n" +
      "He tells you the castle has five rooms worth searching, but it only ever lets you see three at a time.\n\n" +
      "Then you hear Mara. Her voice rises from somewhere inside the walls, calling your name. It seems to come from every direction at once.\n\n" +
      "You turn in circles, trying to find it. Rook grabs your arm.\n\n" +
      "“That's not her.”\n“How do you know?”\n““Because the real Mara knows better than to call out in this place. She'd wait until someone proved they were really you.”\n\n" +
      "Then the voice laughs, from everywhere and nowhere. It sounds exactly like her.",
    choices: [
      { text: "Let Rook pull you away from the door", go: "hub" }
    ]
  },
  hub: {
    label: "CHAPTER 2",
    place: "BLACKTHORN CASTLE · THE SHIFTING HALL",
    title: "The Castle Shifts",
    text: () => {
      let t = "Every time you discover something important, the castle takes something from you. You never get to choose what.\n\nWhere do you go?";
      if (game.rookGone) t = "You are alone now. Only the sound of dripping water keeps you company.\n\n" + t;
      return t;
    },
    choices: [
      { text: "Read the guest book in the entrance hall",
        go: "roomGuest", show: () => isOpen("guestbook") },
      { text: "Search the old chapel full of dead guards",
        go: "roomChapel", show: () => isOpen("chapel") },
      { text: "Follow the crayon marks up to the nursery",
        go: "roomNursery", show: () => isOpen("drawing") },
      { text: "Walk into the gallery where every mirror is cracked",
        go: "roomMirror", show: () => isOpen("mirror") },
      { text: "Search the archive of names under the stairs",
        go: "roomArchive", show: () => isOpen("archive") },
      { text: "Show Rook his old badge",
        go: "confession",
        show: () => game.clues.includes("chapel") && !game.rookGone && !game.rookKnows },
  
      { text: "Go down the stairs toward the red door",
        go: "redDoor", show: () => game.visited.length > 0 }
    ]
  },

  roomGuest: {
    enter: () => findClue("guestbook"),
    label: "CHAPTER 2",
    place: "THE ENTRANCE HALL",
    title: "The Guest Book",
    text:
      "A huge book lies open on a dusty table. Page after page of names. Hundreds of them.\n\n" +
      "One page is in your own handwriting, from a year ago. Most of it has been scratched out.\n\n" +
      "The last entry is in Mara's handwriting: “Mara.”\n\n" +
      "Under it, in tiny letters: “If something wearing my voice says it forgives you, don't believe it. I haven't yet. Ask it, and listen to the answer.”",
    choices: [{ text: "Go back to the main hall", go: "hub" }]
  },

  roomChapel: {
    enter: () => findClue("chapel"),
    label: "CHAPTER 2",
    place: "THE OLD CHAPEL",
    title: "The Chapel of Dead Guards",
    text:
      "Guards in old uniforms lie between the benches, still and silent.\n\n" +
      "On the altar you find a badge. The name on it is ROOK. The date underneath is twenty years old.\n\n" +
      "Rook has been here far longer than a year. And he never told you how long.",
    choices: [{ text: "Go back to the main hall", go: "hub" }]
  },

  roomNursery: {
    enter: () => findClue("drawing"),
    label: "CHAPTER 2",
    place: "THE NURSERY",
    title: "The Faceless Drawing",
    text:
      "A child's drawing is pinned to the wall: a little girl holding hands with a tall creature that has no face.\n\n" +
      "There are more drawings under it. In each one, the creature wears a different face. Someone has drawn the same girl again and again.\n\n" +
      "It does not hide. It borrows.",
    choices: [{ text: "Go back to the main hall", go: "hub" }]
  },

  roomMirror: {
    enter: () => findClue("mirror"),
    label: "CHAPTER 2",
    place: "THE MIRROR GALLERY",
    title: "The Gallery of Cracked Mirrors",
    text:
      "Mirrors cover every wall, each one cracked in a different place. In them you see yourself: your face, your candle, your shaking hands.\n\n" +
      "Taped to the biggest frame is a page torn from a child's notebook, in Mara's handwriting:\n\n" +
      "“It can borrow my voice. It can borrow my face. It cannot borrow my reflection. If you ever doubt me, hold up the glass.”\n\n" +
      "A small hand mirror hangs on a hook beside it. You take it.",
    choices: [{ text: "Go back to the main hall", go: "hub" }]
  },

  roomArchive: {
    enter: () => findClue("archive"),
    label: "CHAPTER 2",
    place: "THE ARCHIVE",
    title: "The Archive of Names",
    text:
      "Shelves of ledgers stretch away under the stairs, each one a list of people the castle has kept. Dates, names, and the cell each person was put in.\n\n" +
      "The oldest ledger is twenty years old. Its last page reads:\n\n" +
      "“ILA, aged nine. Kept in the cell beside the red door. Awaiting exchange.”\n\n" +
      "Beside it, in cramped handwriting, someone has added: “R. is still looking for you.”\n\n" +
      "Far below it, on the last line of the last page, in your own handwriting: “YOU. One memory, surrendered by request.”",
    choices: [{ text: "Go back to the main hall", go: "hub" }]
  },

  confession: {
    enter: () => { game.rookKnows = true; },
    label: "CHAPTER 2",
    place: "BLACKTHORN CASTLE · A QUIET CORNER",
    title: "Rook's Confession",
    text:
      "For the first time, Rook stops pretending everything is fine.\n\n" +
      "“Twenty years ago, I came here looking for my little sister. I took a dead guard's coat so the castle would think I belonged. I never took it off. The castle promised to give her back. All I had to do was bring it someone new.”\n\n" +
      "“Did you bring Mara here?”\n\nHe doesn't answer. But you already know.\n\n" +
      "Rook isn't guiding you only to save Mara. He hopes the castle will finally keep its promise to him. And the worst part? He might genuinely care about you now.\n\n" +
      "He says one more thing, very quietly: “I won't open that red door. Not for her. Not for anyone.”",
    choices: [{ text: "Go back to the main hall", go: "hub" }]
  },
  redDoor: {
    label: "CHAPTER 3",
    place: "THE LOWEST LEVEL",
    title: "The Red Door",
    text: () => {
      let t = "At the bottom of the castle stands a huge red door. Behind it, Mara begs you to let her out.\n\n";
      if (!game.rookGone) {
        t += "Rook tells you the truth: the castle does not eat bodies. It eats memories, voices, names and faces, and uses them to build voices real enough to fool the people who come searching.\n\n";
      }
      t += "The door opens a little. Mara stands on the other side. She looks frightened. She looks tired. She looks exactly like your oldest friend.\n\n“Please. Take me home. I forgive you. I always did.”\n\n" +
           "Then she says the name she used to call you when you were small.\n\n";
      if (!game.rookGone) t += "Rook starts to cry. “Don't listen. That's what it said to me when I found my sister.”\n\n";
      t += "It sounds true. But the castle steals memories. Is a true thing really proof?";
      if (game.clues.includes("guestbook")) {
        t += "\n\nYou remember Mara's hidden message in the guest book: if something wearing her voice says it forgives you, don't believe it.";
      }
      if (game.clues.includes("mirror")) {
        t += "\n\nYou remember her note in the gallery: it cannot borrow a reflection.";
      }
      if (game.clues.includes("chapel") && game.clues.includes("archive") && !game.rookGone) {
        t += "\n\nYou remember the name in the archive ledger. Rook's sister. He has never said it out loud.";
      }
      if (game.bloodLost) {
        t += "\n\nYour hands shake so badly that you could not hold a door against anything.";
      }
      return t + "\n\nNow you must decide.";
    },
    choices: [
      { text: "Ask her: “Do you really forgive me?”", go: "forgive",
        show: () => game.clues.includes("guestbook") && !game.voiceLost },
      { text: "Hold up Mara's hand mirror and watch the glass", go: "reflection",
        show: () => game.clues.includes("mirror") },
      { text: "Call out the name of Rook's sister", go: "twoDoors",
        show: () => game.clues.includes("chapel") && game.clues.includes("archive") && !game.rookGone },
      { text: "Open the door, take Mara's hand and run", go: "nameless" },
      { text: "Stay behind and keep the red door shut", go: "warden",
        show: () => !game.bloodLost },
      { text: "Use what the drawings taught you: command the castle", go: "crown",
        show: () => game.clues.includes("drawing") },
      { text: "Give the last of your candle's light to Rook", go: "light",
        show: () => !game.candleDimmed && !game.rookGone },
      { text: "Stay silent. Answer no voice, however sweet", go: "silent",
        show: () => game.voiceLost },
      { text: "Step aside and let Rook open the red door", go: "openDoor",
        show: () => !game.rookKnows && !game.rookGone }
    ]
  },

  forgive: {
    label: "CHAPTER 3",
    place: "THE LOWEST LEVEL",
    title: "The Honest Answer",
    text: () => {
      let t = "“Do you really forgive me?”\n\n" +
        "The Mara in the doorway answers too quickly. “Of course. It wasn't your fault. I was never angry.”\n\n" +
        "From somewhere far below, a cracked voice answers instead: “No. Not yet. You left me at the gate with your mother's lantern. It slipped and cracked when the dark came. I called for you, and you kept walking. But I'm still here. Come and find me.”\n\n" +
        "The thing at the door stops smiling. Its face begins to slide like melting wax.";
      if (!game.rookGone) t += "\n\n“Run,” Rook says. “That's her. That's the real one.”";
      return t;
    },
    choices: [{ text: "Run toward the real Mara's voice", go: "dawn" }]
  },

  reflection: {
    label: "CHAPTER 3",
    place: "THE LOWEST LEVEL",
    title: "The Girl Without a Reflection",
    text: () => {
      let t = "You raise the little hand mirror from the gallery. The girl in the doorway steps toward you, and the glass shows only an empty doorway.\n\n" +
        "She stops. Her smile stays exactly where it is. Her face begins to slide like melting wax.\n\n" +
        "From somewhere far below, a cracked voice calls your name: “Here! I'm here!”";
      if (!game.rookGone) t += "\n\n“Run,” Rook says. “That's her. That's the real one.”";
      return t;
    },
    choices: [{ text: "Run toward the real Mara's voice", go: "dawn" }]
  },
  // ----- ENDINGS -----
  dawn: {
    ending: true,
    label: "ENDING 1 OF 8 · THE CURSE IS BROKEN",
    place: "THE FRONT GATE, AT SUNRISE",
    title: "The Dawn",
    text: () => {
      let t = "You follow the voice down a staircase hidden beneath the castle. At the bottom, behind an iron door, you find Mara. She is pale and exhausted, but alive.\n\n" +
      "For a moment, neither of you speaks. Then she looks at the cracked lantern in your hands.\n\n" + "“You came back,” she whispers.\n\n" +
      "You want to tell her everything. You want to explain the lies, the fear, and all the reasons it took you so long. But no explanation seems enough. So you reach for her hand, and she lets you take it. Forgiveness can wait. For now, she is here.\n\n";
      if (!game.rookGone) {
        t += "Behind you, the red door begins to tremble. Rook braces himself against it.\n\n" +
        "“Go,” he says. “Before it learns another way out.”\n\n" +
        "You tell him he can come with you. For a moment, he looks as though he might believe you. Then he shakes his head.\n\n" +
        "“I spent twenty years asking this place to give someone back. Let me be the one who finally stops it.”\n\n" +
        "The door slams shut between you. This time, Rook is the one who chooses to stay.";
      } else {
        t += "The castle groans around you. Somewhere in its depths, a door slams, and the whispers fall silent. You do not know what happened to Rook. You only know that you cannot stay to find out.";
      }
      t +=  "You lead Mara towards the front gate. The sky beyond the ruined walls has begun to pale. When you step outside, the first light of morning touches the cracked lantern.\n\n" +
      "For the first time, it gives no light of its own. It doesn't need to.\n\n" +
      "Behind you, Blackthorn Castle stands silent. Ahead, the road home waits. You and Mara begin to walk.";
      return t;
    }
  },

  warden: {
    ending: true,
    label: "ENDING 2 OF 8 · A PROMISE IN THE DARK",
    place: "THE RED DOOR, FOREVER",
    title: "The Warden",
    text:
      "You put your back against the red door and hold it shut.\n\n" +
      "The castle stops hunting. The village sleeps. Nobody else will disappear, as long as someone stays.\n\n" +
      "Behind the door, a voice that sounds like Mara keeps forgiving you. Day after day. It would be so easy to believe it.\n\n" +
      "Sometimes the castle asks, quietly, in your own voice: “Are you protecting her, or hiding from her?”\n\n" +
      "You never answer. You are the castle's new guard."
  },
  crown: {
    ending: true,
    label: "ENDING 3 OF 8 · POWER HAS A PRICE",
    place: "THE THRONE OF VOICES",
    title: "The Hollow Crown",
    text:
      "The drawings taught you that the castle can only imitate. You give it your voice—not in surrender, but as a command. For the first time, the whispers fall silent.\n\n" +
      "The doors open. The whispers go quiet. The castle is yours.\n\n" +
      "But every stolen voice now speaks inside your head. Somewhere among them, Mara is calling you, and you can no longer tell whether it is her or the castle."
  },
  nameless: {
    ending: true,
    label: "ENDING 4 OF 8 · AN EXIT WITHOUT A PAST",
    place: "AN UNKNOWN ROAD",
    title: "The Nameless",
    text:
      "You open the red door, take Mara's hand and run. The castle lets you go far too easily.\n\n" +
      "Outside, a pale, unfamiliar sky waits. You turn to look at your friend, and you realize you cannot remember her name. Or yours. Or your village. Or why you came.\n\n" +
      "The girl beside you smiles with a face that is slightly too perfect. “I forgive you,” she says. You don't remember what for.\n\n" +
      "You escaped with your life. You cannot remember what that life meant."
  },

  light: {
    ending: true,
    label: "ENDING 5 OF 8 · ONE FLAME FOR ANOTHER",
    place: "THE LOWEST STAIR",
    title: "The Last Light",
    text:
      "You cup your candle's last flame and hold it out to Rook.\n\n" +
      "“Why?” he whispers.\n\n" +
      "“Because you're still here,” you say. “And you could still do one thing right.”\n\n" +
      "He walks into the dark carrying your light. You hear him call your name once. Then the darkness closes around you.\n\n" +
      "Someone survives to tell the story. Whether he deserves to is another question."
  },
  silent: {
    ending: true,
    label: "ENDING 6 OF 8 · THE TRUTH WITHOUT A VOICE",
    place: "THE VILLAGE SQUARE",
    title: "The Silent Door",
    text:
      "You have no voice left, so you have nothing to give the castle. You answer no call. Not Mara's. Not Rook's. Not your own.\n\n" +
      "You learn to see the castle's tricks without a word, and you walk out through the front door with a voice that sounds like Mara calling behind you the whole way. You don't answer, because you can't tell which one it is.\n\n" +
      "Outside, you try to warn the village. Your lips move. Nothing comes out. They smile politely and look away.\n\n" +
      "You escaped the trap, but no one hears your warning."
  },
  openDoor: {
    ending: true,
    label: "ENDING 7 OF 8 · THE WARNING YOU IGNORED",
    place: "THE RED DOOR",
    title: "The Open Door",
    text:
      "You step aside. Rook puts his hand on the red door, and his hand is shaking.\n\n" +
      "“She's right there,” he whispers. “Twenty years. Just let me see her.”\n\n" +
      "The door swings open. A little girl in a faded dress steps out and takes his hand, and he cries like a child. He does not see what steps out behind her, already wearing Mara's face.\n\n" +
      "The red door only opens for someone the castle hasn't taken yet. Rook never could open it himself. He needed you standing in front of it.\n\n" +
      "“Someone new,” says the castle, in Mara's voice. “Thank you for bringing me someone new.”\n\n" +
      "The red door closes. Mara's letter said not to let Rook open it. You didn't know why. Now you do.\n\n" +
      "Far above, the front door of Blackthorn Castle swings open. Rook and a nine-year-old girl walk out into the sunrise. Nobody notices that you didn't."
  },
  twoDoors: {
    ending: true,
    label: "ENDING 8 OF 8 · THE PRICE SHARED",
    place: "THE FRONT GATE, AT SUNRISE",
    title: "Two Doors",
    text:
      "You say a name nobody has spoken aloud in twenty years: “Ila.”\n\n" +
      "Rook goes completely still. From the cell beside the red door, a small, cracked voice answers: “Ro?”\n\n" +
      "The thing wearing Mara's face goes quiet. For the first time, it has nothing to copy. Ila's voice is real, and it knows what real sounds like.\n\n" +
      "Rook breaks the lock with his bare hands. A girl of nine, twenty years late, steps into the candlelight. Far below, another voice calls your name, and this time it is really Mara.\n\n" +
      "The castle wants a price for two. Rook looks at you, then at the dark stairs. “It said someone new,” he says gently. “It never said that someone couldn't be old.”\n\n" +
      "He steps through the red door and pulls it shut behind him.\n\n" +
      "You, Mara and a stranger named Ila climb out into the sunrise. Behind you, the front door of Blackthorn Castle closes, for the first time, with no one left to pay."
  }
};
let typer = null; 
function typeText(text, done) {
  clearInterval(typer);          
  const el = $("story");
  let i = 0;                    
  function finish() {
    clearInterval(typer);
    el.textContent = text;       
    el.onclick = null;
    done();                      
  }
  typer = setInterval(() => {
    i++;
    el.textContent = text.slice(0, i);   
    if (i >= text.length) finish();
  }, 10);                        
  el.onclick = finish;           
}
function showScene(id) {
  const scene = scenes[id];
  game.notice = "";                       
  if (scene.enter) scene.enter();         
  document.body.dataset.scene = id;
  document.body.classList.toggle("is-ending", !!scene.ending);
  $("label").textContent = scene.label;
  $("title").textContent = scene.title;
  $("art-caption").textContent = scene.place;   
  $("notice").textContent = "";
  $("choices").innerHTML = "";
  window.scrollTo({ top: 0 });            
  $("story").parentElement.scrollTop = 0; 
  $("card").animate(
    [{ opacity: 0, transform: "translateY(10px)" }, { opacity: 1, transform: "translateY(0)" }],
    { duration: 500, easing: "ease-out" }
  );
  const text = typeof scene.text === "function" ? scene.text() : scene.text;
  const reserve = !scene.ending;         
  if (reserve) {
    $("notice").textContent = game.notice;
    drawChoices(scene);
    $("notice").classList.add("wait");
    $("choices").classList.add("wait");
  }
  typeText(text, () => {
    if (!reserve) {                       
      $("notice").textContent = game.notice;
      drawChoices(scene);
    }
    $("notice").classList.remove("wait");
    $("choices").classList.remove("wait");
    const box = $("story").parentElement;
    box.scrollTop = box.scrollHeight;     
    drawSidePanel();
    $("choices").scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
}
function drawChoices(scene) {
  const box = $("choices");
  box.innerHTML = "";
  // endings 
  if (scene.ending) {
    const again = document.createElement("button");
    again.className = "choice";
    again.textContent = "Play again and find another ending";
    again.onclick = startGame;
    box.appendChild(again);
    return;
  }
  scene.choices.forEach((choice) => {
    if (choice.show && !choice.show()) return; 
    const btn = document.createElement("button");
    btn.className = "choice";
    btn.textContent = choice.text;
    btn.onclick = () => showScene(choice.go);
    box.appendChild(btn);
  });
}
function drawSidePanel() {
  const status = {
    blood: game.bloodLost ? "Weakened" : "Fine",
    light: game.candleDimmed ? "Dim" : "Burning",
    friend: game.rookGone ? "Gone" : "Rook nearby",
    memory: game.prices.includes("A Memory") ? "Scarred" : "Clear",
    voice: game.voiceLost ? "Taken" : "Your own"
  };
  for (const key in status) $("st-" + key).textContent = status[key];
  // Rook's quote
  let quote = "“Don't trust the whispers.”";
  if (game.rookGone) quote = "Rook has vanished.";
  else if (game.rookKnows) quote = "“Now you know. Please don't hate me.”";
  $("rook-status").textContent = quote;

  const list = $("clue-list");
  list.innerHTML = "";
  game.clues.forEach((c) => addClueLine(list, "✦ " + CLUES[c], ""));
  game.lostClues.forEach((c) => addClueLine(list, "✦ " + CLUES[c] + " (forgotten)", "clue-lost"));
  if (game.clues.length + game.lostClues.length === 0) addClueLine(list, "No clues yet.", "empty-clue");
  $("clue-count").textContent = String(game.clues.length).padStart(2, "0");
}
function addClueLine(parent, text, extraClass) {
  const p = document.createElement("p");
  p.className = "clue-item " + extraClass;
  p.textContent = text;
  parent.appendChild(p);
}
function startGame() {
  newGame(); 
  drawSidePanel();
  $("title-screen").classList.add("hidden");
  $("game-screen").classList.remove("hidden");
  showScene("start");
}
$("begin-btn").onclick = startGame;
$("restart-btn").onclick = startGame;