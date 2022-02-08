CREATE TABLE "auth" (
	"id"	INTEGER,
	"username"	TEXT NOT NULL,
	"password"	TEXT NOT NULL,
	"site"	TEXT NOT NULL,
	PRIMARY KEY("id"),
	UNIQUE("username","site")
);
CREATE TABLE "categories" (
	"id"	INTEGER,
	"name"	TEXT NOT NULL UNIQUE,
	PRIMARY KEY("id")
);
CREATE TABLE "notes" (
	"id"	INTEGER,
	"category"	INTEGER NOT NULL,
	"name"	TEXT NOT NULL,
	"content"	TEXT NOT NULL DEFAULT '{"ops":[{"insert":"\n"}]}',
	"modified"	INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
	FOREIGN KEY("category") REFERENCES "categories"("id") ON DELETE CASCADE,
	PRIMARY KEY("id"),
    UNIQUE("name","category")
);
CREATE TABLE "share" (
	"user"	INTEGER NOT NULL,
	"note"	INTEGER NOT NULL,
	FOREIGN KEY("note") REFERENCES "notes"("id") ON DELETE CASCADE,
	FOREIGN KEY("user") REFERENCES "auth"("id") ON DELETE CASCADE,
	UNIQUE("user","note")
);