
const REVIEW_SORT_OPTIONS = [
    { value: 'newest',  label: 'Most Recent'   },
    { value: 'oldest',  label: 'Oldest First'  },
    { value: 'highest', label: 'Highest Rated' },
    { value: 'lowest',  label: 'Lowest Rated'  },
];

const RECOMMENDATION_SORT_OPTIONS = [
    { value: 'highest',     label: 'Highest Rated'  },
    { value: 'lowest',      label: 'Lowest Rated'   },
    { value: 'title_asc',   label: 'Title: A -> Z'  },
    { value: 'title_desc',  label: 'Title: Z -> A'  },
    { value: 'author_asc',  label: 'Author: A -> Z' },
    { value: 'author_desc', label: 'Author: Z -> A' },
]

module.exports = {REVIEW_SORT_OPTIONS, RECOMMENDATION_SORT_OPTIONS};