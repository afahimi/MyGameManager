let AGGREGATION_OPS = {
    "SUM" : "Sum of",
    "MIN" : "Minimum of", 
    "MAX" : "Maximum of", 
    "AVG" : "Average of",
    "COUNT" : "Count of"
}

let OPERATORS = [
    ">",
    "<",
    ">=",
    "<=",
    "equals",
    "not equals"
]

let PRIMARY_KEYS = {
    CHARACTERINFO: ["CHARACTERID"],
    CONTAINS: ["INVENTORYID", "ITEMID"],
    COORDINATELOCATIONS: ["COORDINATES"],
    DEVELOPS: ["SKILLNAME", "CHARACTERID"],
    FACTIONS: ["FACTIONNAME"],
    INTERACTIONS: ["PLAYERCHARACTERID",	"NONPLAYABLECHARACTERCHARACTERID"],
    INVENTORY: ["INVENTORYID"],
    ITEM: ["ITEMDID"],
    LOCATIONS: ["LOCATIONNAME"],
    MEMBEROF: ["CHARACTERID"],
    NONPLAYABLECHARACTER: ["CHARACTERID"],
    PLAYER: ["CHARACTERID", "INVENTORYID"],
    QUESTREWARDS: ["QUESTID"],
    REWARDITEMS: ["REWARDQUANTITY"],
    SKILL: ["SKILLNAME"],
    YIELDSQUEST: ["QUESTID", "PLAYERCHARACTERID", "NONPLAYABLECHARACTERID"]
}

let FOREIGN_KEYS = {
    "COORDINATELOCATIONS": "Location",
    "CHARACTERINFO": "Coordinate Locations",
    "MEMBEROF": "Character, Factions",
    "DEVELOPS": "Skill, Character",
    "PLAYER": "Character",
    "NONPLAYABLECHARACTER": "Character",
    "CONTAINS": "Inventory, Items",
    "INTERACTIONS": "Player Info, NPC Info",
    "YIELDSQUEST": "Player Interaction Log",
    "REWARDITEMS": "Items",
    "QUESTREWARDS": "Yields Quest, Reward Items"
    
  };

  let CHILDREN_TABLE = {
    "LOCATIONS": ["Coordinate Locations"],
    "COORDINATELOCATIONS": ["Character"],
    "CHARACTERINFO": ["Faction List", "Player Skills", "Player Info", "NPC Info"],
    "FACTIONS": ["Faction List"],
    "SKILL": ["Player Skills"],
    "INVENTORY": ["Inventory Contents"],
    "ITEM": ["Inventory Contents", "Reward Items"],
    "PLAYER": ["Player Interaction Log"],
    "NONPLAYABLECHARACTER": ["Player Interaction Log"],
    "INTERACTIONS": ["Yields Quest"],
    "YIELDSQUEST": ["Quest Rewards"],
    "REWARDITEMS": ["Quest Rewards"]
  };

let ATTRIBUTE_USER_IDS = {
    CHARACTERID: "Character ID",
    INVENTORYID: "Inventory ID",
    NONPLAYABLECHARACTERCHARACTERID: "NPC ID",
    PLAYERCHARACTERID: "Player ID",
    COORDINATES: "Coordinates",
    CHARACTERNAME: "Name",
    HEALTH: "Health",
    OVERALLLEVEL: "Level",
    MANA: "Mana",
    LOCATIONNAME: "Location Name",
    ITEMID: "Item ID"
}


export {AGGREGATION_OPS, OPERATORS, PRIMARY_KEYS, ATTRIBUTE_USER_IDS, FOREIGN_KEYS, CHILDREN_TABLE}