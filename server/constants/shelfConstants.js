const SHELF_STATUSES = ['want_to_read', 'reading', 'read', 'dnf'];

const MEDIA_TYPES = ['print', 'ebook', 'audiobook'];

const SHELF_STATUS_LABELS = {
    want_to_read: 'Want to Read',
    reading: 'Reading',
    read: 'Read',
    dnf: 'Did Not Finish',
};

const MEDIA_TYPE_LABELS = {
    print: 'Print',
    ebook: 'E-Book',
    audiobook: 'Audiobook',
};

const SYSTEM_SHELVES = [
    { name: 'Want to Read', slug: 'want_to_read' },
    { name: 'Reading',      slug: 'reading'      },
    { name: 'Read',         slug: 'read'         },
    { name: 'Did Not Finish', slug: 'dnf'        },
];

module.exports = { SHELF_STATUSES, MEDIA_TYPES, SHELF_STATUS_LABELS, MEDIA_TYPE_LABELS, SYSTEM_SHELVES };