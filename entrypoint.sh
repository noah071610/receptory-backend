#!/bin/sh  

# Apply Prisma migrations and start the application  
npx prisma migrate deploy --schema=/usr/src/app/prisma/schema.prisma  
npx prisma generate --schema=/usr/src/app/prisma/schema.prisma  

# Run database migrations  
npx prisma migrate dev --name init --schema=/usr/src/app/prisma/schema.prisma

# Run the main container command  
exec "$@"