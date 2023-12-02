export type NestedAggregation = {
  [key: string]: string;
};

/* Queries for aggregation, nested aggregation and nested queries with aggregation (including group by, having) */
export const nestedAggregation: NestedAggregation = {
  "Players with No Items": `SELECT P.CharacterID, C.CharacterName
     FROM Player P, CharacterInfo C
     WHERE NOT EXISTS (
                        SELECT * 
                        FROM Contains C
                        WHERE C.InventoryID = P.InventoryID )
    AND P.CharacterID = C.CharacterID`,

  "Players with All Skills": `SELECT P.CharacterID, C.CharacterName
     FROM Player P, CharacterInfo C
     WHERE (SELECT COUNT(DISTINCT D.SkillName) 
            FROM Develops D 
            WHERE D.CharacterID = P.CharacterID) = (SELECT COUNT(*) FROM SKILL)
            AND P.CharacterID = C.CharacterID`,

  "Players with No Skills": `SELECT P.CharacterID, C.CharacterName
     FROM Player P, CharacterInfo C
     WHERE NOT EXISTS (
                        SELECT *
                        FROM Develops D
                        WHERE D.CharacterID = P.CharacterID )
                        AND P.CharacterID = C.CharacterID`,

  "All Players with Health Greater than Average Player Health": `SELECT P.CharacterID, Health, CharacterName
     FROM Player P, CharacterInfo C 
     WHERE P.CharacterID = C.CharacterID AND C.Health > (SELECT AVG(Health) 
                                                         FROM CharacterInfo C2, Player P1 
                                                         WHERE P1.CharacterID = C2.CharacterID)`,

    "Count of Players with Health Greater than Average Player Health For each Level": `SELECT COUNT(P.CharacterID) AS Count, OVERALLLEVEL
    FROM Player P, CharacterInfo C 
    WHERE P.CharacterID = C.CharacterID AND C.Health > (SELECT AVG(Health) 
                                                        FROM CharacterInfo C2, Player P1 
                                                        WHERE P1.CharacterID = C2.CharacterID)
    GROUP BY OVERALLLEVEL`,

  "All Players with Level Greater than Average Player Level": `SELECT DISTINCT P.CharacterID, OverallLevel, CharacterName
     FROM Player P, CharacterInfo C 
     WHERE P.CharacterID = C.CharacterID AND C.OverallLevel > (SELECT AVG(OverallLevel) 
                                                               FROM CharacterInfo C2, Player P1 
                                                               WHERE P1.CharacterID = C2.CharacterID)`,

  "All Players with Level Less than Average Player Level": `SELECT DISTINCT CharacterName, P.CharacterID, OverallLevel
     FROM Player P, CharacterInfo C 
     WHERE P.CharacterID = C.CharacterID AND C.OverallLevel < (SELECT AVG(OverallLevel) 
                                                               FROM CharacterInfo C2, Player P1 
                                                               WHERE P1.CharacterID = C2.CharacterID)`,

  "All Locations with No Players": `SELECT L.LocationName, L.LocationType
     FROM Locations L 
     WHERE NOT EXISTS (SELECT * 
                       FROM CoordinateLocations CL, CharacterInfo C 
                       WHERE L.LocationName = CL.LocationName AND CL.Coordinates = C.Coordinates AND C.CharacterID IN (SELECT CharacterID FROM Player))`,
};
