# Game-Theater-IOI-vol.4

REPO - CREATED

2025.02.24
Prisma initiated
Backend server listening at 8080 

BASIC CRUD for user backend completed, tested

BASIC CRUD for questions backend completed, tested

2025.02.25
BASIC CRUD for answers backend completed, tested

BASIC CRUD for game backend completed, tested

Dev merged into main

2025.03.01
RESET FOR GAME
NEXT QUESTION WORKS
    Kiküldi az aktuális kérdés plusz egyet? - ez amúgy hiba itt. Ennek nem így kéne lenni. !!!
    Törli a collAnswer tartalmát
    vár 20 mp-t
    megszámolja a colAnswer tartalmát és kiadja a nyertest
    frissíti a game adatait (beteszi a rel.question számát és bent hagyja a győztes answer adatait)
        Ha az answer bug megoldódik ez itt valószínűleg nem lesz jó, mert csak az id-t fogja tárolni, ami alapján lehet majd lekérdezni. De az nem baj.
ANswer - bug
    ONE BUG - only one type of id is possible for an answer...
    !!KÉNE EGY USER_ANSWER kapcsolótábla és azokat a kapcsolatokat kéne felvinni a collAnswers tömbbe és onnan kiolvasni majd a megfelelő választ.!!