#!/bin/bash

# Railway Variables Check Script
# Checks critical environment variables for all multisite services

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Services to check
SERVICES=("Day News" "GoEventCity" "Downtown Guide" "Go Local Voices" "Alphasite")

# Critical variables to check
CRITICAL_VARS=("APP_KEY" "APP_URL" "DATABASE_URL" "REDIS_URL")

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo -e "${BLUE}  Railway Variables Status Check${NC}"
echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""

TOTAL_ISSUES=0

for service in "${SERVICES[@]}"; do
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    echo -e "${BLUE}📋 Service: ${service}${NC}"
    echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
    
    SERVICE_ISSUES=0
    
    # Get all variables for this service
    VAR_OUTPUT=$(railway variables --service "$service" 2>&1 || true)
    
    # Check each critical variable
    for var in "${CRITICAL_VARS[@]}"; do
        # Parse Railway table format: ║ VAR_NAME │ VALUE ║
        VAR_VALUE=$(echo "$VAR_OUTPUT" | grep -E "║.*${var}" | awk -F'│' '{print $2}' | sed 's/║//g' | xargs || echo "")
        
        if [ -z "$VAR_VALUE" ] || [ "$VAR_VALUE" = "" ]; then
            echo -e "${RED}❌ ${var}: NOT SET${NC}"
            SERVICE_ISSUES=$((SERVICE_ISSUES + 1))
            TOTAL_ISSUES=$((TOTAL_ISSUES + 1))
        else
            # Truncate long values for display
            DISPLAY_VALUE="$VAR_VALUE"
            if [ ${#DISPLAY_VALUE} -gt 60 ]; then
                DISPLAY_VALUE="${DISPLAY_VALUE:0:57}..."
            fi
            
            # Check for specific issues
            if [ "$var" = "APP_KEY" ]; then
                if [[ ! "$VAR_VALUE" =~ ^base64: ]]; then
                    echo -e "${RED}❌ ${var}: Invalid format (should start with 'base64:')${NC}"
                    echo -e "   Value: ${DISPLAY_VALUE}"
                    SERVICE_ISSUES=$((SERVICE_ISSUES + 1))
                    TOTAL_ISSUES=$((TOTAL_ISSUES + 1))
                else
                    echo -e "${GREEN}✅ ${var}: Set${NC}"
                fi
            elif [ "$var" = "DATABASE_URL" ]; then
                if [[ ! "$VAR_VALUE" =~ railway\.internal ]]; then
                    echo -e "${YELLOW}⚠️  ${var}: May not be using internal Railway format${NC}"
                    echo -e "   Value: ${DISPLAY_VALUE}"
                else
                    echo -e "${GREEN}✅ ${var}: Set (internal format)${NC}"
                fi
            elif [ "$var" = "REDIS_URL" ]; then
                if [[ ! "$VAR_VALUE" =~ railway\.internal ]]; then
                    echo -e "${YELLOW}⚠️  ${var}: May not be using internal Railway format${NC}"
                    echo -e "   Value: ${DISPLAY_VALUE}"
                else
                    echo -e "${GREEN}✅ ${var}: Set (internal format)${NC}"
                fi
            elif [ "$var" = "APP_URL" ]; then
                if [[ ! "$VAR_VALUE" =~ ^https:// ]]; then
                    echo -e "${YELLOW}⚠️  ${var}: Should use HTTPS${NC}"
                    echo -e "   Value: ${DISPLAY_VALUE}"
                else
                    echo -e "${GREEN}✅ ${var}: Set${NC}"
                    echo -e "   Value: ${DISPLAY_VALUE}"
                fi
            else
                echo -e "${GREEN}✅ ${var}: Set${NC}"
                echo -e "   Value: ${DISPLAY_VALUE}"
            fi
        fi
    done
    
    # Check additional variables
    APP_ENV=$(echo "$VAR_OUTPUT" | grep "^APP_ENV=" | cut -d'=' -f2- | xargs || echo "")
    APP_DEBUG=$(echo "$VAR_OUTPUT" | grep "^APP_DEBUG=" | cut -d'=' -f2- | xargs || echo "")
    
    echo ""
    echo -e "${BLUE}Additional Variables:${NC}"
    if [ -n "$APP_ENV" ]; then
        echo -e "   APP_ENV: ${APP_ENV}"
    fi
    if [ -n "$APP_DEBUG" ]; then
        echo -e "   APP_DEBUG: ${APP_DEBUG}"
    fi
    
    if [ $SERVICE_ISSUES -eq 0 ]; then
        echo -e "${GREEN}✅ All critical variables are set correctly${NC}"
    else
        echo -e "${RED}❌ Found ${SERVICE_ISSUES} issue(s)${NC}"
    fi
    
    echo ""
done

echo -e "${BLUE}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
if [ $TOTAL_ISSUES -eq 0 ]; then
    echo -e "${GREEN}✅ All services have critical variables configured correctly${NC}"
    exit 0
else
    echo -e "${RED}❌ Found ${TOTAL_ISSUES} total issue(s) across all services${NC}"
    exit 1
fi
