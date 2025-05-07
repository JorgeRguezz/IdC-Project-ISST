package es.upm.dit.isst.ioh.service;

public interface LockApiService {

    boolean unlockDoor(String lockId);
    boolean lockDoor(String lockId);
    boolean checkLockStatus(String lockId);
    String mapInternalIdToExternalId(Long internalId);
    
}
