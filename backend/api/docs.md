
on every endpoint change run:

services/api
python manage.py spectacular --file ../../packages/api/schema/openapi.yaml

from the root
pnpm --filter @campus/api generate