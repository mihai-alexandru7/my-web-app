import { mysqlTable, mysqlSchema, AnyMySqlColumn, int, varchar, text, decimal, smallint, mysqlEnum, datetime, char, tinyint, boolean, primaryKey, index, uniqueIndex, foreignKey, check } from "drizzle-orm/mysql-core"
import { sql } from "drizzle-orm"

export const publisherProfiles = mysqlTable("publisher_profiles", {
	userId: int("user_id", { unsigned: true }).primaryKey().references(() => users.id, { onDelete: "cascade" } ),
	publisherName: varchar("publisher_name", { length: 200 }).notNull(),
	description: text(),
},
(table) => [
	uniqueIndex("uq_publisher_name").on(table.publisherName),
]);

export const users = mysqlTable("users", {
	id: int({ unsigned: true }).autoincrement().primaryKey(),
	email: varchar({ length: 255 }).notNull(),
	passwordHash: varchar("password_hash", { length: 255 }).notNull(),
	firstName: varchar("first_name", { length: 100 }),
	lastName: varchar("last_name", { length: 100 }),
	role: mysqlEnum(["reader","publisher","administrator"]).default("reader").notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: datetime("updated_at").default(sql`CURRENT_TIMESTAMP`).onUpdateNow().notNull(),
},
(table) => [
	index("idx_users_role").on(table.role),
	uniqueIndex("uq_users_email").on(table.email),
]);

export const authors = mysqlTable("authors", {
	id: int({ unsigned: true }).autoincrement().primaryKey(),
	name: varchar({ length: 200 }).notNull(),
},
(table) => [
	index("ft_authors_name").on(table.name),
	index("idx_authors_name").on(table.name),
]);

export const categories = mysqlTable("categories", {
	id: int({ unsigned: true }).autoincrement().primaryKey(),
	name: varchar({ length: 100 }).notNull(),
},
(table) => [
	uniqueIndex("uq_categories_name").on(table.name),
]);

export const genres = mysqlTable("genres", {
	id: int({ unsigned: true }).autoincrement().primaryKey(),
	name: varchar({ length: 100 }).notNull(),
},
(table) => [
	uniqueIndex("uq_genres_name").on(table.name),
]);

export const languages = mysqlTable("languages", {
	id: int({ unsigned: true }).autoincrement().primaryKey(),
	code: char({ length: 2 }).notNull(),
	name: varchar({ length: 50 }).notNull(),
},
(table) => [
	uniqueIndex("uq_languages_code").on(table.code),
]);

export const books = mysqlTable("books", {
	id: int({ unsigned: true }).autoincrement().primaryKey(),
	publisherId: int("publisher_id", { unsigned: true }).notNull().references(() => publisherProfiles.userId, { onDelete: "restrict" } ),
	languageId: int("language_id", { unsigned: true }).notNull().references(() => languages.id, { onDelete: "restrict" } ),
	title: varchar({ length: 255 }).notNull(),
	description: text(),
	price: decimal({ precision: 10, scale: 2 }).notNull(),
	coverPath: varchar("cover_path", { length: 500 }),
	filePath: varchar("file_path", { length: 500 }).notNull(),
	samplePath: varchar("sample_path", { length: 500 }),
	isbn: varchar({ length: 20 }),
	publishedYear: smallint("published_year"),
	status: mysqlEnum(["pending","approved","rejected","withdrawn"]).default("pending").notNull(),
	reviewedBy: int("reviewed_by", { unsigned: true }).references(() => users.id, { onDelete: "set null" } ),
	reviewedAt: datetime("reviewed_at"),
	rejectionReason: varchar("rejection_reason", { length: 500 }),
	createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: datetime("updated_at").default(sql`CURRENT_TIMESTAMP`).onUpdateNow().notNull(),
},
(table) => [
	index("ft_books_title").on(table.title),
	index("idx_books_language").on(table.languageId),
	index("idx_books_price").on(table.price),
	index("idx_books_publisher").on(table.publisherId),
	index("idx_books_status").on(table.status),
	uniqueIndex("uq_books_isbn").on(table.isbn),
	check("books_chk_1", sql`(\`price\` >= 0)`),
]);

export const bookAuthors = mysqlTable("book_authors", {
	bookId: int("book_id", { unsigned: true }).notNull().references(() => books.id, { onDelete: "cascade" } ),
	authorId: int("author_id", { unsigned: true }).notNull().references(() => authors.id, { onDelete: "cascade" } ),
},
(table) => [
	primaryKey({ columns: [table.bookId, table.authorId] }),	index("idx_book_authors_author").on(table.authorId),
]);

export const bookGenres = mysqlTable("book_genres", {
	bookId: int("book_id", { unsigned: true }).notNull().references(() => books.id, { onDelete: "cascade" } ),
	genreId: int("genre_id", { unsigned: true }).notNull().references(() => genres.id, { onDelete: "cascade" } ),
},
(table) => [
	primaryKey({ columns: [table.bookId, table.genreId] }),	index("idx_book_genres_genre").on(table.genreId),
]);

export const bookCategories = mysqlTable("book_categories", {
	bookId: int("book_id", { unsigned: true }).notNull().references(() => books.id, { onDelete: "cascade" } ),
	categoryId: int("category_id", { unsigned: true }).notNull().references(() => categories.id, { onDelete: "cascade" } ),
},
(table) => [
	primaryKey({ columns: [table.bookId, table.categoryId] }),	index("idx_book_categories_category").on(table.categoryId),
]);

export const cartItems = mysqlTable("cart_items", {
	userId: int("user_id", { unsigned: true }).notNull().references(() => users.id, { onDelete: "cascade" } ),
	bookId: int("book_id", { unsigned: true }).notNull().references(() => books.id, { onDelete: "cascade" } ),
	addedAt: datetime("added_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.userId, table.bookId] }),	index("idx_cart_items_book").on(table.bookId),
]);

export const wishlistItems = mysqlTable("wishlist_items", {
	userId: int("user_id", { unsigned: true }).notNull().references(() => users.id, { onDelete: "cascade" } ),
	bookId: int("book_id", { unsigned: true }).notNull().references(() => books.id, { onDelete: "cascade" } ),
	addedAt: datetime("added_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.userId, table.bookId] }),	index("idx_wishlist_items_book").on(table.bookId),
]);

export const collections = mysqlTable("collections", {
	id: int({ unsigned: true }).autoincrement().primaryKey(),
	userId: int("user_id", { unsigned: true }).notNull().references(() => users.id, { onDelete: "cascade" } ),
	name: varchar({ length: 100 }).notNull(),
	createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
},
(table) => [
	uniqueIndex("uq_collection_user_name").on(table.userId, table.name),
	uniqueIndex("uq_collections_id_user").on(table.id, table.userId),
]);

export const orderItems = mysqlTable("order_items", {
	id: int({ unsigned: true }).autoincrement().primaryKey(),
	orderId: int("order_id", { unsigned: true }).notNull().references(() => orders.id, { onDelete: "cascade" } ),
	bookId: int("book_id", { unsigned: true }).notNull().references(() => books.id, { onDelete: "restrict" } ),
	priceAtPurchase: decimal("price_at_purchase", { precision: 10, scale: 2 }).notNull(),
},
(table) => [
	index("idx_order_items_book").on(table.bookId),
	uniqueIndex("uq_order_items_book").on(table.orderId, table.bookId),
	check("chk_order_items_price", sql`(\`price_at_purchase\` >= 0)`),
]);

export const orders = mysqlTable("orders", {
	id: int({ unsigned: true }).autoincrement().primaryKey(),
	userId: int("user_id", { unsigned: true }).notNull().references(() => users.id, { onDelete: "restrict" } ),
	totalAmount: decimal("total_amount", { precision: 10, scale: 2 }).notNull(),
	paymentMethod: varchar("payment_method", { length: 50 }),
	paymentRef: varchar("payment_ref", { length: 100 }),
	status: mysqlEnum(["pending","paid","failed","refunded"]).default("pending").notNull(),
	createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
},
(table) => [
	index("idx_orders_status").on(table.status),
	index("idx_orders_user").on(table.userId),
	check("chk_orders_total", sql`(\`total_amount\` >= 0)`),
]);

export const userLibrary = mysqlTable("user_library", {
	userId: int("user_id", { unsigned: true }).notNull().references(() => users.id, { onDelete: "cascade" } ),
	bookId: int("book_id", { unsigned: true }).notNull().references(() => books.id, { onDelete: "restrict" } ),
	orderItemId: int("order_item_id", { unsigned: true }).references(() => orderItems.id, { onDelete: "set null" } ),
	acquiredAt: datetime("acquired_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
	lastPosition: varchar("last_position", { length: 255 }),
	lastReadAt: datetime("last_read_at"),
},
(table) => [
	primaryKey({ columns: [table.userId, table.bookId] }),	index("idx_user_library_book").on(table.bookId),
	index("idx_user_library_order_item").on(table.orderItemId),
]);

export const collectionBooks = mysqlTable("collection_books", {
	collectionId: int("collection_id", { unsigned: true }).notNull(),
	userId: int("user_id", { unsigned: true }).notNull(),
	bookId: int("book_id", { unsigned: true }).notNull(),
	addedAt: datetime("added_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
},
(table) => [
	primaryKey({ columns: [table.collectionId, table.bookId] }),	index("idx_collection_books_collection").on(table.collectionId, table.userId),
	index("idx_collection_books_library").on(table.userId, table.bookId),
	foreignKey({
		columns: [table.collectionId, table.userId],
		foreignColumns: [collections.id, collections.userId],
		name: "fk_collection_books_collections"
	}).onDelete("cascade"),
	foreignKey({
		columns: [table.userId, table.bookId],
		foreignColumns: [userLibrary.userId, userLibrary.bookId],
		name: "fk_collection_books_user_library"
	}).onDelete("cascade"),
]);

export const reviews = mysqlTable("reviews", {
	id: int({ unsigned: true }).autoincrement().primaryKey(),
	userId: int("user_id", { unsigned: true }).notNull(),
	bookId: int("book_id", { unsigned: true }).notNull(),
	rating: tinyint({ unsigned: true }),
	comment: text(),
	createdAt: datetime("created_at").default(sql`CURRENT_TIMESTAMP`).notNull(),
	updatedAt: datetime("updated_at").default(sql`CURRENT_TIMESTAMP`).onUpdateNow().notNull(),
},
(table) => [
	index("idx_reviews_book").on(table.bookId),
	uniqueIndex("uq_review_user_book").on(table.userId, table.bookId),
	foreignKey({
		columns: [table.userId, table.bookId],
		foreignColumns: [userLibrary.userId, userLibrary.bookId],
		name: "fk_reviews_user_library"
	}).onDelete("cascade"),
	check("chk_reviews_rating", sql`((\`rating\` is null) or (\`rating\` between 1 and 5))`),
	check("chk_reviews_not_empty", sql`((\`rating\` is not null) or (\`comment\` is not null))`),
]);
