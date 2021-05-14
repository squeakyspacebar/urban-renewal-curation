#!/bin/sh -e

# Edit the following to change the name of the database user that will be created:
APP_DB_USER=humanface
APP_DB_PASS=humanface

# Edit the following to change the name of the database that is created (defaults to the user name)
APP_DB_NAME=$APP_DB_USER

# Edit the following to change the version of PostgreSQL that is installed
PG_VERSION=13
#POSTGIS_VERSION=3

###########################################################
# Changes below this line are probably not necessary
###########################################################
print_db_usage () {
  echo "Your PostgreSQL database has been setup and can be accessed on your local machine on the forwarded port (default: 15432)"
  echo "  Host: localhost"
  echo "  Port: 5432"
  echo "  Database: $APP_DB_NAME"
  echo "  Username: $APP_DB_USER"
  echo "  Password: $APP_DB_PASS"
  echo ""
  echo "Admin access to postgres user via VM:"
  echo "  vagrant ssh"
  echo "  sudo su - postgres"
  echo ""
  echo "psql access to app database user via VM:"
  echo "  vagrant ssh"
  echo "  sudo su - postgres"
  echo "  PGUSER=$APP_DB_USER PGPASSWORD=$APP_DB_PASS psql -h localhost $APP_DB_NAME"
  echo ""
  echo "Env variable for application development:"
  echo "  DATABASE_URL=postgresql://$APP_DB_USER:$APP_DB_PASS@localhost:15432/$APP_DB_NAME"
  echo ""
  echo "Local command to access the database via psql:"
  echo "  PGUSER=$APP_DB_USER PGPASSWORD=$APP_DB_PASS psql -h localhost -p 15432 $APP_DB_NAME"
}

export DEBIAN_FRONTEND=noninteractive

PG_APT_REPO_SRC_FILEPATH="/etc/apt/sources.list.d/pgdg.list"
PG_APT_REPO_KEY_FILEPATH="/usr/share/keyrings/postgresql-archive-keyring.gpg"

# Import repository signing key
wget -q -O - https://www.postgresql.org/media/keys/ACCC4CF8.asc | gpg --dearmor > $PG_APT_REPO_KEY_FILEPATH

# Add Postgres APT repository
echo "deb [signed-by=$PG_APT_REPO_KEY_FILEPATH] http://apt.postgresql.org/pub/repos/apt/ $(lsb_release -sc)-pgdg main" > "$PG_APT_REPO_SRC_FILEPATH"

# Manage system packages
apt-get update
apt-get -y upgrade
apt-get -y remove apache2
apt-get -y autoremove
apt-get -y install gettext
apt-get -y install nginx
apt-get -y install php-fpm
apt-get -y install php-pgsql
apt-get -y install php-mbstring
apt-get -y install php-gd
apt-get -y install php-tidy

if [ -f "/var/www/html/index.html" ]; then
  sudo rm /var/www/html/index.html
fi

PROVISIONED_ON=/etc/vm_provision_on_timestamp
if [ -f "$PROVISIONED_ON" ]; then
  echo "VM was already provisioned at: $(cat $PROVISIONED_ON)"
  echo "To run system updates manually login via 'vagrant ssh' and run 'apt-get update && apt-get upgrade'"
  echo ""
  print_db_usage
  exit
fi

apt-get -y install "postgresql-$PG_VERSION" "postgresql-contrib-$PG_VERSION"
#apt-get -y install postgis "postgresql-$PG_VERSION-postgis-$POSTGIS_VERSION"

PG_CONF="/etc/postgresql/$PG_VERSION/main/postgresql.conf"
PG_HBA="/etc/postgresql/$PG_VERSION/main/pg_hba.conf"

# Edit postgresql.conf to change listen address to '*':
sed -i "s/#listen_addresses = 'localhost'/listen_addresses = '*'/" "$PG_CONF"

# Append to pg_hba.conf to add password auth:
echo "host    all             all             all                     md5" >> "$PG_HBA"

# Explicitly set default client_encoding
echo "client_encoding = utf8" >> "$PG_CONF"

# Restart so that all new config is loaded:
systemctl restart postgresql

cat << EOF | su - postgres -c psql
-- Create the database user:
CREATE USER $APP_DB_USER WITH PASSWORD '$APP_DB_PASS'  superuser;

ALTER USER $APP_DB_USER WITH SUPERUSER CREATEDB;

-- Create the database:
CREATE DATABASE $APP_DB_NAME WITH OWNER=$APP_DB_USER
                                  LC_COLLATE='en_US.utf8'
                                  LC_CTYPE='en_US.utf8'
                                  ENCODING='UTF8'
                                  TEMPLATE=template0;
EOF

# Tag the provision time:
date > "$PROVISIONED_ON"

echo "Successfully created PostgreSQL dev virtual machine."
echo ""
print_db_usage

systemctl restart postgresql

export PGPASSWORD=$APP_DB_PASS
psql -U $APP_DB_USER -h localhost $APP_DB_NAME < /var/www/db_dump/humanface_dev.sql
echo "$APP_DB_NAME was successfully imported to the PostgreSQL."

# Set up Nginx site configuration
mv /tmp/nginx/sites-available/default /etc/nginx/sites-available/default
systemctl restart nginx
