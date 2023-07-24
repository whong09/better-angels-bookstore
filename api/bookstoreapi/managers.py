from django.contrib.postgres.search import SearchQuery
from django.db import models


class BookManager(models.Manager):
    """
    Book manager with search method
    """

    def search(self, query):
        """
        Book text search based on django support for postgres fts
        https://docs.djangoproject.com/en/4.2/ref/contrib/postgres/search/
        """
        search_query = SearchQuery(query, search_type="websearch")
        contains_queryset = self.get_queryset().filter(title__icontains=query)
        contains_queryset |= self.get_queryset().filter(author__icontains=query)
        contains_queryset |= self.get_queryset().filter(genre__icontains=query)
        trigram_queryset = self.get_queryset().filter(title__trigram_similar=query)
        trigram_queryset |= self.get_queryset().filter(author__trigram_similar=query)
        vector_queryset = self.get_queryset().filter(search_vector=search_query)

        return (contains_queryset | trigram_queryset | vector_queryset).distinct()
