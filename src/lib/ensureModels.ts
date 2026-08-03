/**
 * Import all Mongoose models to ensure they are registered before any
 * populate() call. Call this at the top of every API route that uses
 * cross-collection populate.
 *
 * In Next.js each serverless route gets a fresh module context, so
 * models referenced only via populate() string names (e.g. "Brand") must
 * be imported somewhere in the same request context — otherwise Mongoose
 * throws MissingSchemaError.
 */

// Importing these registers them with Mongoose's model registry
import "@/models/User";
import "@/models/Category";
import "@/models/Brand";
import "@/models/Product";
import "@/models/Cart";
import "@/models/Order";
import "@/models/Review";
import "@/models/Banner";
