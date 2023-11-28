export type NestedAggregation = {
    [key : string] : string;
};

export const nestedAggregation: NestedAggregation = {

    "Players with No Items":

    `SELECT P.CharacterID
     FROM Player P
     WHERE NOT EXISTS (
                        SELECT * 
                        FROM Contains C
                        WHERE C.InventoryID = P.InventoryID )`,

    "Players with All Skills": 

    `SELECT P.CharacterID 
     FROM Player P 
     WHERE (SELECT COUNT(DISTINCT D.SkillName) 
            FROM Develops D 
            WHERE D.CharacterID = P.CharacterID) = (SELECT COUNT(*) FROM SKILL)`,

    "Players with No Skills":

    `SELECT P.CharacterID
     FROM Player P
     WHERE NOT EXISTS (
                        SELECT *
                        FROM Develops D
                        WHERE D.CharacterID = P.CharacterID )`,

    "All Players with Health Greater than Average Player Health": 

    `SELECT P.CharacterID, Health, CharacterName
     FROM Player P, CharacterInfo C 
     WHERE P.CharacterID = C.CharacterID AND C.Health > (SELECT AVG(Health) 
                                                         FROM CharacterInfo C2, Player P1 
                                                         WHERE P1.CharacterID = C2.CharacterID)`,

    "All Players with Level Greater than Average Player Level": 

    `SELECT DISTINCT P.CharacterID, OverallLevel, CharacterName
     FROM Player P, CharacterInfo C 
     WHERE P.CharacterID = C.CharacterID AND C.OverallLevel > (SELECT AVG(OverallLevel) 
                                                               FROM CharacterInfo C2, Player P1 
                                                               WHERE P1.CharacterID = C2.CharacterID)`, 

    "All Players with Level Less than Average Player Level":

    `SELECT DISTINCT P.CharacterID, OverallLevel 
     FROM Player P, CharacterInfo C 
     WHERE P.CharacterID = C.CharacterID AND C.OverallLevel < (SELECT AVG(OverallLevel) 
                                                               FROM CharacterInfo C2, Player P1 
                                                               WHERE P1.CharacterID = C2.CharacterID)`, 


    "All Locations with No Players": 

    `SELECT L.LocationName 
     FROM Locations L 
     WHERE NOT EXISTS (SELECT * 
                       FROM CoordinateLocations CL, CharacterInfo C 
                       WHERE L.LocationName = CL.LocationName AND CL.Coordinates = C.Coordinates AND C.CharacterID IN (SELECT CharacterID FROM Player))`,

}