import { ref } from 'vue'

export const useBooks = () => {
    const topPicksBooks = ref([
        {
            id: 1,
            title: 'East of Eden',
            slug: 'east-of-eden',
            author: 'John Steinbeck',
            cover: 'https://images2.penguinrandomhouse.com/cover/9781440631320',
            description: 'A masterpiece of Biblical scope, and the magnum opus of one of America’s most enduring authors, in a commemorative hardcover edition\n' +
                ' \n' +
                'In his journal, Nobel Prize winner John Steinbeck called East of Eden "the first book," and indeed it has the primordial power and simplicity of myth. Set in the rich farmland of California\'s Salinas Valley, this sprawling and often brutal novel follows the intertwined destinies of two families—the Trasks and the Hamiltons—whose generations helplessly reenact the fall of Adam and Eve and the poisonous rivalry of Cain and Abel.\n' +
                '\n' +
                'The masterpiece of Steinbeck’s later years, East of Eden is a work in which Steinbeck created his most mesmerizing characters and explored his most enduring themes: the mystery of identity, the inexplicability of love, and the murderous consequences of love\'s absence. Adapted for the 1955 film directed by Elia Kazan introducing James Dean, and read by thousands as the book that brought Oprah’s Book Club back, East of Eden has remained vitally present in American culture for over half a century.'
        },
        {
            id: 2,
            title: 'Serpentine',
            slug: 'serpentine',
            author: 'Philip Pullman',
            cover: 'https://images2.penguinrandomhouse.com/cover/9780593377697',
            description: 'A bewitching tale with a fascinating new glimpse of young Lyra and her dæmon, Pantalaimon. This companion to the New York Times bestselling His Dark Materials and The Book of Dust series follows Pullman\'s beloved characters on a brand new adventure.\n' +
                '\n' +
                'After the world-altering events of The Amber Spyglass, Lyra and Pan find themselves irrevocably changed. In this new companion story, set after the stunning conclusion to the original His Dark Materials trilogy, Lyra and Pan will journey to the far North once more, hoping to ask the Consul of Witches a most urgent question.\n' +
                '\n' +
                'This brand-new story, a beguiling must-read for Pullman fans old and new, is a perfect companion to His Dark Materials and a fascinating bridge to The Book of Dust.'
        },
        {
            id: 3,
            title: 'Klara and the Sun',
            slug: 'klara-and-the-sun',
            author: 'Kazuo Ishiguro',
            cover: 'https://images2.penguinrandomhouse.com/cover/9780593318188',
            description: 'A NEW YORK TIMES NOTABLE BOOK • A BOOKER PRIZE NOMINEE • From the Nobel Prize-winning author of Never Let Me Go and The Remains of the Day, a magnificent novel about the wondrous, mysterious nature of the human heart.\n' +
                '\n' +
                '“A masterpiece that will make you think about life, mortality, the saving grace of love: in short, the all of it.” —Maureen Corrigan, NPR\n' +
                '\n' +
                'Here is the story of Klara, an Artificial Friend with outstanding observational qualities, who, from her place in the store, watches carefully the behavior of those who come in to browse, and of those who pass on the street outside. She remains hopeful that a customer will soon choose her, but when the possibility emerges that her circumstances may change forever, Klara is warned not to invest too much in the promises of humans.\n' +
                '\n' +
                'A thrilling feat of world-building and a novel of exquisite tenderness and impeccable restraint, Klara and the Sun is a magnificent achievement, one that offers a look at our changing world through the eyes of an unforgettable narrator to explore the fundamental question: what does it mean to love?'
        },
    ])

    const classicBooks = ref([
        {
            id: 4,
            title: 'Of Mice and Men',
            slug: 'of-mice-and-men',
            author: 'John Steinbeck',
            cover: 'https://images3.penguinrandomhouse.com/cover/9780140186420',
            description: 'Over seventy-five years since its first publication, Steinbeck’s tale of commitment, loneliness, hope, and loss remains one of America’s most widely read and taught novels. An unlikely pair, George and Lennie, two migrant workers in California during the Great Depression, grasp for their American Dream. They hustle work when they can, living a hand-to-mouth existence. For George and Lennie have a plan: to own an acre of land and a shack they can call their own. When they land jobs on a ranch in the Salinas Valley, the fulfillment of their dream seems to be within their grasp. But even George cannot guard Lennie from the provocations, nor predict the consequences of Lennie\'s unswerving obedience to the things George taught him.\n' +
                '\n' +
                'Of Mice and Men represents an experiment in form, which Steinbeck described as “a kind of playable novel, written in a novel form but so scened and set that it can be played as it stands.” A rarity in American letters, it achieved remarkable success as a novel, a Broadway play, and three acclaimed films. This edition features an introduction by Susan Shillinglaw, one of today’s leading Steinbeck scholars.\n' +
                '\n' +
                'For more than seventy years, Penguin has been the leading publisher of classic literature in the English-speaking world. With more than 1,700 titles, Penguin Classics represents a global bookshelf of the best works throughout history and across genres and disciplines. Readers trust the series to provide authoritative texts enhanced by introductions and notes by distinguished scholars and contemporary authors, as well as up-to-date translations by award-winning translators.'
        },
        {
            id: 5,
            title: 'The Grapes of Wrath',
            slug: 'the-grapes-of-wrath',
            author: 'John Steinbeck',
            cover: 'https://images3.penguinrandomhouse.com/cover/9781440637124',
            description: 'The Pulitzer Prize-winning epic of the Great Depression, a book that galvanized—and sometimes outraged—millions of readers. Nominated as one of America’s best-loved novels by PBS’s The Great American Read\n' +
                '\n' +
                'First published in 1939, Steinbeck’s Pulitzer Prize-winning epic of the Great Depression chronicles the Dust Bowl migration of the 1930s and tells the story of one Oklahoma farm family, the Joads—driven from their homestead and forced to travel west to the promised land of California. Out of their trials and their repeated collisions against the hard realities of an America divided into Haves and Have-Nots evolves a drama that is intensely human yet majestic in its scale and moral vision, elemental yet plainspoken, tragic but ultimately stirring in its human dignity. A portrait of the conflict between the powerful and the powerless, of one man’s fierce reaction to injustice, and of one woman’s stoical strength, the novel captures the horrors of the Great Depression and probes into the very nature of equality and justice in America. At once a naturalistic epic, captivity narrative, road novel, and transcendental gospel, Steinbeck’s powerful landmark novel is perhaps the most American of American Classics.\n' +
                '\n' +
                'This Penguin Classics edition contains an introduction and notes by Steinbeck scholar Robert Demott.\n' +
                '\n' +
                'For more than seventy years, Penguin has been the leading publisher of classic literature in the English-speaking world. With more than 1,800 titles, Penguin Classics represents a global bookshelf of the best works throughout history and across genres and disciplines. Readers trust the series to provide authoritative texts enhanced by introductions and notes by distinguished scholars and contemporary authors, as well as up-to-date translations by award-winning translators.'
        },
        {
            id: 6,
            title: 'Lord of the Flies',
            slug: 'lord-of-the-flies',
            author: 'William Golding',
            cover: 'https://images2.penguinrandomhouse.com/cover/9780593513453',
            description: 'William Golding’s profound tale of stranded youth, survival, and the shadowy depths of human nature\n' +
                '\n' +
                'At the dawn of the next World War, a plane crash strands a group of schoolboys on a remote island. There are no grownups. No rules. Freedom is celebrated. But when strange, distant noises and visions of a beast begin to haunt the boys, their fragile order unravels, and all hopes of rescue fade.\n' +
                '\n' +
                'Since 1954, William Golding’s Lord of the Flies has shaped our understanding of human nature — the latent darkness within, and the destructive or creative capacity of collective will. This edition also includes essays on reading and teaching the novel, an introduction from the 1962 edition by E. M. Forster, and notes by E. L. Epstein, scholar and book editor of the first 1959 American paperback edition, to contextualize Golding’s classic as one of the most timeless and socially relevant texts in the last century of literature.\n' +
                '\n' +
                'Penguin Classics is the leading publisher of classic literature in the English-speaking world, representing a global bookshelf of the best works throughout history and across genres and disciplines. Readers trust the series to provide authoritative texts enhanced by introductions and notes by distinguished scholars and contemporary authors, as well as up-to-date translations by award-winning translators.'
        },
        {
            id: 7,
            title: 'Hangsaman',
            slug: 'hangsaman',
            author: 'Shirley Jackson',
            cover: 'https://images3.penguinrandomhouse.com/cover/9781101616765',
            description: 'Shirley Jackson’s chilling second novel, based on her own experiences and an actual mysterious disappearance\n' +
                '\n' +
                'Seventeen-year-old Natalie Waite longs to escape home for college. Her father is a domineering and egotistical writer who keeps a tight rein on Natalie and her long-suffering mother. When Natalie finally does get away, however, college life doesn’t bring the happiness she expected. Little by little, Natalie is no longer certain of anything—even where reality ends and her dark imaginings begin. Chilling and suspenseful, Hangsaman is loosely based on the real-life disappearance of a Bennington College sophomore in 1946.\n' +
                '\n' +
                'For more than seventy years, Penguin has been the leading publisher of classic literature in the English-speaking world. With more than 1,700 titles, Penguin Classics represents a global bookshelf of the best works throughout history and across genres and disciplines. Readers trust the series to provide authoritative texts enhanced by introductions and notes by distinguished scholars and contemporary authors, as well as up-to-date translations by award-winning translators.'
        }
    ])

    const getBookBySlug = (slug) => {
        const allBooks = [...topPicksBooks.value, ...classicBooks.value]
        return allBooks.find(b => b.slug === slug)
    }

    return {
        topPicksBooks,
        classicBooks,
        getBookBySlug
    }
}