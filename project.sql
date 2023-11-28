DROP TABLE QuestRewards;
DROP TABLE YieldsQuest;
DROP TABLE Interactions;
DROP TABLE Contains;
DROP TABLE Inventory;
DROP TABLE Player;
DROP TABLE NonPlayableCharacter;
DROP TABLE RewardItems;
DROP TABLE Develops;
DROP TABLE MemberOf;
DROP TABLE CharacterInfo;
DROP TABLE CoordinateLocations;
DROP TABLE Skill;
DROP TABLE Factions;
DROP TABLE Item;
DROP TABLE Locations;

CREATE TABLE Locations (
    LocationName VARCHAR2(255) PRIMARY KEY,
    LocationType VARCHAR2(255)
);

CREATE TABLE CoordinateLocations (
    Coordinates VARCHAR2(255) PRIMARY KEY,
    LocationName VARCHAR2(255) NOT NULL REFERENCES Locations(LocationName) 
ON DELETE CASCADE
);

CREATE TABLE CharacterInfo (
    CharacterID INT PRIMARY KEY,
    Coordinates VARCHAR2(255) REFERENCES CoordinateLocations(Coordinates) 
ON DELETE CASCADE,
    Health INT,
    OverallLevel INT,
    Mana INT,
    CharacterName VARCHAR2(255)
);

CREATE TABLE Factions (
    FactionName VARCHAR2(255) PRIMARY KEY,
    FactionType VARCHAR2(255)
);

CREATE TABLE MemberOf (
    CharacterID INT,
    FactionName VARCHAR2(255),
    PRIMARY KEY (CharacterID, FactionName),
    FOREIGN KEY (CharacterID) REFERENCES CharacterInfo(CharacterID) ON 
DELETE CASCADE,
    FOREIGN KEY (FactionName) REFERENCES Factions(FactionName) ON DELETE 
CASCADE
);

CREATE TABLE Skill (
    SkillName VARCHAR2(255) PRIMARY KEY,
    SkillType VARCHAR2(255)
);

CREATE TABLE Develops (
    SkillName VARCHAR2(255),
    CharacterID INT,
    CurrentLevel INT,
    PRIMARY KEY (SkillName, CharacterID),
    FOREIGN KEY (SkillName) REFERENCES Skill(SkillName) ON DELETE CASCADE,
    FOREIGN KEY (CharacterID) REFERENCES CharacterInfo(CharacterID) ON
DELETE CASCADE
);

CREATE TABLE Player (
    CharacterID INT PRIMARY KEY,
    InventoryID INT UNIQUE,
    FOREIGN KEY (CharacterID) REFERENCES CharacterInfo(CharacterID) ON 
DELETE CASCADE
);

CREATE TABLE Inventory (
    InventoryID INT PRIMARY KEY,
    InventorySize INT
);

CREATE TABLE NonPlayableCharacter (
    CharacterID INT PRIMARY KEY,
    Personality VARCHAR2(255),
    FOREIGN KEY (CharacterID) REFERENCES CharacterInfo(CharacterID) ON 
DELETE CASCADE
);

CREATE TABLE Item (
    ItemID INT PRIMARY KEY,
    ItemName VARCHAR2(255)
);

CREATE TABLE Contains (
    InventoryID INT,
    ItemID INT,
    InventoryQuantity INT,
    PRIMARY KEY (InventoryID, ItemID),
    FOREIGN KEY (InventoryID) REFERENCES Inventory(InventoryID) ON DELETE 
CASCADE,
    FOREIGN KEY (ItemID) REFERENCES Item(ItemID) ON DELETE CASCADE
);

CREATE TABLE Interactions (
    PlayerCharacterID INT,
    NonPlayableCharacterCharacterID INT,
    InteractionTime TIMESTAMP NOT NULL,
    InteractionType VARCHAR2(255),
    PRIMARY KEY (PlayerCharacterID, NonPlayableCharacterCharacterID, 
InteractionTime),
    FOREIGN KEY (PlayerCharacterID) REFERENCES Player(CharacterID) ON 
DELETE CASCADE,
    FOREIGN KEY (NonPlayableCharacterCharacterID) REFERENCES 
NonPlayableCharacter(CharacterID) ON DELETE CASCADE
);

CREATE TABLE YieldsQuest (
    QuestID INT PRIMARY KEY,
    PlayerCharacterID INT,
    NonPlayableCharacterID INT,
    InteractionTime TIMESTAMP,
    QuestLevel INT,
    FOREIGN KEY (PlayerCharacterID, NonPlayableCharacterID, 
InteractionTime) REFERENCES Interactions(PlayerCharacterID, 
NonPlayableCharacterCharacterID, InteractionTime) ON DELETE CASCADE
);

CREATE TABLE RewardItems (
    RewardQuantity INT PRIMARY KEY,
    ItemID INT,
    FOREIGN KEY (ItemID) REFERENCES Item(ItemID) ON DELETE CASCADE
);

CREATE TABLE QuestRewards (
    QuestID INT PRIMARY KEY,
    RewardQuantity INT,
    FOREIGN KEY (QuestID) REFERENCES YieldsQuest(QuestID) ON DELETE 
CASCADE,
    FOREIGN KEY (RewardQuantity) REFERENCES RewardItems(RewardQuantity) ON 
DELETE CASCADE
);

INSERT INTO Locations (LocationName, LocationType) VALUES ('Floating City', 'Sky');
INSERT INTO Locations (LocationName, LocationType) VALUES ('The Great Forest', 'Forest');
INSERT INTO Locations (LocationName, LocationType) VALUES ('The End', 'Endgame');
INSERT INTO Locations (LocationName, LocationType) VALUES ('Atlantis', 'Sea');
INSERT INTO Locations (LocationName, LocationType) VALUES ('Verudon', 'City');

INSERT INTO CoordinateLocations (Coordinates, LocationName) VALUES ('10-20-103', 'Floating City');
INSERT INTO CoordinateLocations (Coordinates, LocationName) VALUES ('15-25-20', 'The Great Forest');
INSERT INTO CoordinateLocations (Coordinates, LocationName) VALUES ('5-15-20', 'The Great Forest');
INSERT INTO CoordinateLocations (Coordinates, LocationName) VALUES ('5-15-22', 'The Great Forest');
INSERT INTO CoordinateLocations (Coordinates, LocationName) VALUES ('20-30-40', 'The End');
INSERT INTO CoordinateLocations (Coordinates, LocationName) VALUES ('22-36-40', 'The End');

INSERT INTO CharacterInfo (CharacterID, Health, OverallLevel, Mana, CharacterName, Coordinates) VALUES (1382, 100, 28, 38, 'RemmyRoblox', '10-20-103');
INSERT INTO CharacterInfo (CharacterID, Health, OverallLevel, Mana, CharacterName, Coordinates) VALUES (3312, 90, 4, 40, 'Mercury1989', '15-25-20');
INSERT INTO CharacterInfo (CharacterID, Health, OverallLevel, Mana, CharacterName, Coordinates) VALUES (5869, 80, 3, 60, 'AminTheAdmin', '5-15-20');
INSERT INTO CharacterInfo (CharacterID, Health, OverallLevel, Mana, CharacterName, Coordinates) VALUES (1129, 70, 2, 70, 'SteveGamer', '20-30-40');
INSERT INTO CharacterInfo (CharacterID, Health, OverallLevel, Mana, CharacterName, Coordinates) VALUES (1269, 60, 1, 80, 'xX_JoeShmoe_Xx', '22-36-40');
INSERT INTO CharacterInfo (CharacterID, Health, OverallLevel, Mana, CharacterName, Coordinates) VALUES (2001, 1120, 28, 38, 'Average Man', '5-15-20');
INSERT INTO CharacterInfo (CharacterID, Health, OverallLevel, Mana, CharacterName, Coordinates) VALUES (2002, 90, 4, 40, 'Witch', '5-15-20');
INSERT INTO CharacterInfo (CharacterID, Health, OverallLevel, Mana, CharacterName, Coordinates) VALUES (2003, 82, 3, 60, 'Bug', '5-15-22');
INSERT INTO CharacterInfo (CharacterID, Health, OverallLevel, Mana, CharacterName, Coordinates) VALUES (2004, 70, 2, 70, 'Demon', '20-30-40');
INSERT INTO CharacterInfo (CharacterID, Health, OverallLevel, Mana, CharacterName, Coordinates) VALUES (2005, 50, 1, 80, 'Demon Dark', '22-36-40');

INSERT INTO Factions (FactionName, FactionType) VALUES ('Skyguard', 'Holy');
INSERT INTO Factions (FactionName, FactionType) VALUES ('Forestwatch', 'Neutral');
INSERT INTO Factions (FactionName, FactionType) VALUES ('Endkeepers', 'Dark');
INSERT INTO Factions (FactionName, FactionType) VALUES ('Seaguard', 'Neutral');
INSERT INTO Factions (FactionName, FactionType) VALUES ('Citywatch', 'Lawful');

INSERT INTO MemberOf (CharacterID, FactionName) VALUES (1382, 'Skyguard');
INSERT INTO MemberOf (CharacterID, FactionName) VALUES (3312, 'Forestwatch');
INSERT INTO MemberOf (CharacterID, FactionName) VALUES (5869, 'Forestwatch');
INSERT INTO MemberOf (CharacterID, FactionName) VALUES (1129, 'Endkeepers');
INSERT INTO MemberOf (CharacterID, FactionName) VALUES (1269, 'Endkeepers');

INSERT INTO Skill (SkillName, SkillType) VALUES ('Sky Slash', 'Attack');
INSERT INTO Skill (SkillName, SkillType) VALUES ('Forest Heal', 'Heal');
INSERT INTO Skill (SkillName, SkillType) VALUES ('End Shield', 'Defense');
INSERT INTO Skill (SkillName, SkillType) VALUES ('Sea Wave', 'Attack');
INSERT INTO Skill (SkillName, SkillType) VALUES ('City Guard', 'Defense');

INSERT INTO Develops (SkillName, CharacterID, CurrentLevel) VALUES ('Sky Slash', 1382, 10);
INSERT INTO Develops (SkillName, CharacterID, CurrentLevel) VALUES ('Forest Heal', 3312, 5);
INSERT INTO Develops (SkillName, CharacterID, CurrentLevel) VALUES ('Forest Heal', 5869, 3);
INSERT INTO Develops (SkillName, CharacterID, CurrentLevel) VALUES ('End Shield', 1129, 8);
INSERT INTO Develops (SkillName, CharacterID, CurrentLevel) VALUES ('City Guard', 1269, 2);

INSERT INTO Player (CharacterID, InventoryID) VALUES (1382, 1001);
INSERT INTO Player (CharacterID, InventoryID) VALUES (3312, 1002);
INSERT INTO Player (CharacterID, InventoryID) VALUES (5869, 1003);
INSERT INTO Player (CharacterID, InventoryID) VALUES (1129, 1004);
INSERT INTO Player (CharacterID, InventoryID) VALUES (1269, 1005);

INSERT INTO NonPlayableCharacter (CharacterID, Personality) VALUES (2001, 'Aggressive');
INSERT INTO NonPlayableCharacter (CharacterID, Personality) VALUES (2002, 'Helpful');
INSERT INTO NonPlayableCharacter (CharacterID, Personality) VALUES (2003, 'Mysterious');
INSERT INTO NonPlayableCharacter (CharacterID, Personality) VALUES (2004, 'Talkative');
INSERT INTO NonPlayableCharacter (CharacterID, Personality) VALUES (2005, 'Silent');

INSERT INTO Inventory (InventoryID, InventorySize) VALUES (1001, 20);
INSERT INTO Inventory (InventoryID, InventorySize) VALUES (1002, 15);
INSERT INTO Inventory (InventoryID, InventorySize) VALUES (1003, 18);
INSERT INTO Inventory (InventoryID, InventorySize) VALUES (1004, 25);
INSERT INTO Inventory (InventoryID, InventorySize) VALUES (1005, 10);

INSERT INTO Item (ItemID, ItemName) VALUES (1001, 'Sword of Light');
INSERT INTO Item (ItemID, ItemName) VALUES (1002, 'Dark Shield');
INSERT INTO Item (ItemID, ItemName) VALUES (1003, 'Health Potion');
INSERT INTO Item (ItemID, ItemName) VALUES (1004, 'Bow of Eternity');
INSERT INTO Item (ItemID, ItemName) VALUES (1005, 'Ring of Strength');

INSERT INTO Contains (InventoryID, ItemID, InventoryQuantity) VALUES (1001, 1001, 1);
INSERT INTO Contains (InventoryID, ItemID, InventoryQuantity) VALUES (1001, 1002, 1);
INSERT INTO Contains (InventoryID, ItemID, InventoryQuantity) VALUES (1001, 1004, 1);
INSERT INTO Contains (InventoryID, ItemID, InventoryQuantity) VALUES (1001, 1003, 1);
INSERT INTO Contains (InventoryID, ItemID, InventoryQuantity) VALUES (1001, 1007, 1);
INSERT INTO Contains (InventoryID, ItemID, InventoryQuantity) VALUES (1001, 1005, 1);
INSERT INTO Contains (InventoryID, ItemID, InventoryQuantity) VALUES (1002, 1002, 1);
INSERT INTO Contains (InventoryID, ItemID, InventoryQuantity) VALUES (1003, 1003, 5);
INSERT INTO Contains (InventoryID, ItemID, InventoryQuantity) VALUES (1004, 1004, 2);
INSERT INTO Contains (InventoryID, ItemID, InventoryQuantity) VALUES (1005, 1005, 3);

INSERT INTO Interactions (PlayerCharacterID, NonPlayableCharacterCharacterID, InteractionTime, InteractionType) 
VALUES (1382, 2001, TIMESTAMP '1970-01-01 00:00:00' + NUMTODSINTERVAL(1634280600, 'SECOND'), 'Conversation');
INSERT INTO Interactions (PlayerCharacterID, NonPlayableCharacterCharacterID, InteractionTime, InteractionType) 
VALUES (3312, 2002, TIMESTAMP '1970-01-01 00:00:00' + NUMTODSINTERVAL(1634366700, 'SECOND'), 'Combat');
INSERT INTO Interactions (PlayerCharacterID, NonPlayableCharacterCharacterID, InteractionTime, InteractionType) 
VALUES (5869, 2003, TIMESTAMP '1970-01-01 00:00:00' + NUMTODSINTERVAL(1634452800, 'SECOND'), 'Trade');
INSERT INTO Interactions (PlayerCharacterID, NonPlayableCharacterCharacterID, InteractionTime, InteractionType) 
VALUES (1129, 2004, TIMESTAMP '1970-01-01 00:00:00' + NUMTODSINTERVAL(1634538600, 'SECOND'), 'Trade');
INSERT INTO Interactions (PlayerCharacterID, NonPlayableCharacterCharacterID, InteractionTime, InteractionType) 
VALUES (1269, 2005, TIMESTAMP '1970-01-01 00:00:00' + NUMTODSINTERVAL(1634624700, 'SECOND'), 'Conversation');

INSERT INTO YieldsQuest(QuestID, PlayerCharacterID, NonPlayableCharacterID, InteractionTime, QuestLevel) 
VALUES (101, 1382, 2001, TIMESTAMP '1970-01-01 00:00:00' + NUMTODSINTERVAL(1634280600, 'SECOND'), 68);
INSERT INTO YieldsQuest(QuestID, PlayerCharacterID, NonPlayableCharacterID, InteractionTime, QuestLevel) 
VALUES (112, 3312, 2002, TIMESTAMP '1970-01-01 00:00:00' + NUMTODSINTERVAL(1634366700, 'SECOND'), 47);
INSERT INTO YieldsQuest(QuestID, PlayerCharacterID, NonPlayableCharacterID, InteractionTime, QuestLevel) 
VALUES (312, 5869, 2003, TIMESTAMP '1970-01-01 00:00:00' + NUMTODSINTERVAL(1634452800, 'SECOND'), 18);
INSERT INTO YieldsQuest(QuestID, PlayerCharacterID, NonPlayableCharacterID, InteractionTime, QuestLevel) 
VALUES (12, 1129, 2004, TIMESTAMP '1970-01-01 00:00:00' + NUMTODSINTERVAL(1634538600, 'SECOND'), 120);
INSERT INTO YieldsQuest(QuestID, PlayerCharacterID, NonPlayableCharacterID, InteractionTime, QuestLevel) 
VALUES (99, 1269, 2005, TIMESTAMP '1970-01-01 00:00:00' + NUMTODSINTERVAL(1634624700, 'SECOND'), 38);

INSERT INTO RewardItems (RewardQuantity, ItemID) VALUES (1, 1001);
INSERT INTO RewardItems (RewardQuantity, ItemID) VALUES (2, 1002);
INSERT INTO RewardItems (RewardQuantity, ItemID) VALUES (5, 1003);
INSERT INTO RewardItems (RewardQuantity, ItemID) VALUES (3, 1004);
INSERT INTO RewardItems (RewardQuantity, ItemID) VALUES (4, 1005);

INSERT INTO QuestRewards (QuestID, RewardQuantity) VALUES (101, 1);
INSERT INTO QuestRewards (QuestID, RewardQuantity) VALUES (112, 1);
INSERT INTO QuestRewards (QuestID, RewardQuantity) VALUES (312, 5);
INSERT INTO QuestRewards (QuestID, RewardQuantity) VALUES (12, 1);
INSERT INTO QuestRewards (QuestID, RewardQuantity) VALUES (99, 3);

