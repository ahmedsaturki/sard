import { Posts } from './posts.js';
import { Pages } from './pages.js';
import { Categories } from './categories.js';
import { Tags } from './tags.js';
import { Media } from './media.js';
import { Users } from './users.js';
import { Forms } from './forms.js';

// Re-export all collections
export { Posts, Pages, Categories, Tags, Media, Users, Forms };

// Export array for Payload config
export const sardCollections = [Posts, Pages, Categories, Tags, Media, Users, Forms];
