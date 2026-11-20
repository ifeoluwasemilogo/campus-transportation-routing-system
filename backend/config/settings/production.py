import os

from django.core.exceptions import ImproperlyConfigured

from .base import *

DEBUG = False

if not os.getenv('SECRET_KEY'):
    raise ImproperlyConfigured('Set SECRET_KEY before using production settings.')
if os.getenv('DB_ENGINE', '').lower() != 'mysql':
    raise ImproperlyConfigured('Production settings require DB_ENGINE=mysql.')
if not os.getenv('ALLOWED_HOSTS'):
    raise ImproperlyConfigured('Set ALLOWED_HOSTS before using production settings.')

SESSION_COOKIE_SECURE = True
CSRF_COOKIE_SECURE = True
SECURE_CONTENT_TYPE_NOSNIFF = True
SECURE_REFERRER_POLICY = 'strict-origin-when-cross-origin'
SECURE_HSTS_SECONDS = 31536000
SECURE_HSTS_INCLUDE_SUBDOMAINS = True
SECURE_SSL_REDIRECT = os.getenv('SECURE_SSL_REDIRECT', 'true').lower() == 'true'
SECURE_PROXY_SSL_HEADER = ('HTTP_X_FORWARDED_PROTO', 'https')
